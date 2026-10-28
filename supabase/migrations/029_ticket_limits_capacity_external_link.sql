-- 029: Ticket limits, event capacity, and external link button text
--
-- Run this in the Supabase SQL Editor BEFORE deploying the matching code.
--
--   * max_per_order            -> "Max Tickets Per Purchase" (1-10). Existing events keep their value.
--   * ticket_capacity          -> "Total Tickets Available" (in-person only). NULL = unlimited.
--   * external_link_button_text-> editable label for the external link button.
--
-- Tickets count as SOLD when a registration is:
--   free, paid, pending by check, or 'processing' (a PayPal payment being captured right now).
-- Abandoned PayPal checkouts (pending + paypal) do NOT count.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.event_registrations_events
  ADD COLUMN IF NOT EXISTS ticket_capacity int;

ALTER TABLE public.event_registrations_events
  ADD COLUMN IF NOT EXISTS external_link_button_text text;

-- Keep existing values, but make sure they're inside the new 1-10 range
UPDATE public.event_registrations_events
  SET max_per_order = LEAST(GREATEST(COALESCE(max_per_order, 10), 1), 10)
  WHERE max_per_order IS NULL OR max_per_order < 1 OR max_per_order > 10;

-- New events default to 1 ticket per purchase
ALTER TABLE public.event_registrations_events
  ALTER COLUMN max_per_order SET DEFAULT 1;

ALTER TABLE public.event_registrations_events
  DROP CONSTRAINT IF EXISTS event_max_per_order_range;
ALTER TABLE public.event_registrations_events
  ADD CONSTRAINT event_max_per_order_range CHECK (max_per_order BETWEEN 1 AND 10);

ALTER TABLE public.event_registrations_events
  DROP CONSTRAINT IF EXISTS event_ticket_capacity_positive;
ALTER TABLE public.event_registrations_events
  ADD CONSTRAINT event_ticket_capacity_positive CHECK (ticket_capacity IS NULL OR ticket_capacity >= 1);

COMMENT ON COLUMN public.event_registrations_events.max_per_order IS 'Max tickets one person can buy in a single purchase (1-10)';
COMMENT ON COLUMN public.event_registrations_events.ticket_capacity IS 'Total tickets available for in-person events. NULL = unlimited';
COMMENT ON COLUMN public.event_registrations_events.external_link_button_text IS 'Label for the external link button shown when use_external_registration is true';

-- ---------------------------------------------------------------------------
-- Tickets sold for an event
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.event_tickets_sold(p_event_id uuid, p_exclude_registration uuid DEFAULT NULL)
RETURNS int
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(SUM(COALESCE(tickets, 1)), 0)::int
  FROM public.event_registrations
  WHERE event_id = p_event_id
    AND (p_exclude_registration IS NULL OR id <> p_exclude_registration)
    AND (
      payment_status IN ('free', 'paid', 'processing')
      OR (payment_status = 'pending' AND payment_provider = 'check')
    );
$$;

-- ---------------------------------------------------------------------------
-- Atomic insert for FREE and PAY-BY-CHECK registrations.
-- Locks the event row so two people can't grab the last tickets at the same time.
-- Returns {ok: true, registration: {...}} or {ok: false, reason: 'sold_out' | 'not_enough' | 'over_limit' | 'not_found'}
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_event_registration(p_event_id uuid, p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event   public.event_registrations_events%ROWTYPE;
  v_tickets int := COALESCE((p_data->>'tickets')::int, 1);
  v_sold    int;
  v_row     public.event_registrations%ROWTYPE;
BEGIN
  SELECT * INTO v_event
  FROM public.event_registrations_events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF v_tickets < 1 OR v_tickets > COALESCE(v_event.max_per_order, 10) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'over_limit', 'max_per_order', v_event.max_per_order);
  END IF;

  IF v_event.ticket_capacity IS NOT NULL THEN
    v_sold := public.event_tickets_sold(p_event_id);
    IF v_sold >= v_event.ticket_capacity THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'sold_out');
    END IF;
    IF v_sold + v_tickets > v_event.ticket_capacity THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'not_enough');
    END IF;
  END IF;

  INSERT INTO public.event_registrations (
    event_id, full_name, email, phone,
    address_line1, address_line2, city, state, postal_code, country,
    tickets, registration_type, is_anonymous, public_message, guest_names, marketing_opt_in,
    payment_status, payment_provider, payment_id
  ) VALUES (
    p_event_id,
    p_data->>'full_name',
    p_data->>'email',
    p_data->>'phone',
    p_data->>'address_line1',
    p_data->>'address_line2',
    p_data->>'city',
    p_data->>'state',
    p_data->>'postal_code',
    p_data->>'country',
    v_tickets,
    COALESCE(p_data->>'registration_type', 'individual'),
    COALESCE((p_data->>'is_anonymous')::boolean, false),
    p_data->>'public_message',
    CASE WHEN jsonb_typeof(p_data->'guest_names') = 'array' THEN p_data->'guest_names' ELSE NULL END,
    COALESCE((p_data->>'marketing_opt_in')::boolean, false),
    COALESCE(p_data->>'payment_status', 'free'),
    p_data->>'payment_provider',
    p_data->>'payment_id'
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object('ok', true, 'registration', to_jsonb(v_row));
END;
$$;

-- ---------------------------------------------------------------------------
-- PayPal: hold the tickets right before capturing the payment.
-- If there's room, the registration moves to 'processing' (counts as sold).
-- If not, nothing is captured, so the buyer is never charged.
-- Returns {ok: true} or {ok: false, reason: 'sold_out' | 'not_enough' | 'not_found'}
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_paypal_registration(p_payment_id text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reg   public.event_registrations%ROWTYPE;
  v_event public.event_registrations_events%ROWTYPE;
  v_sold  int;
BEGIN
  SELECT * INTO v_reg FROM public.event_registrations WHERE payment_id = p_payment_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  -- Already held or paid: nothing to do
  IF v_reg.payment_status IN ('processing', 'paid') THEN
    RETURN jsonb_build_object('ok', true);
  END IF;

  SELECT * INTO v_event FROM public.event_registrations_events WHERE id = v_reg.event_id FOR UPDATE;

  IF v_event.ticket_capacity IS NOT NULL THEN
    v_sold := public.event_tickets_sold(v_reg.event_id, v_reg.id);
    IF v_sold >= v_event.ticket_capacity THEN
      UPDATE public.event_registrations SET payment_status = 'failed' WHERE id = v_reg.id;
      RETURN jsonb_build_object('ok', false, 'reason', 'sold_out');
    END IF;
    IF v_sold + COALESCE(v_reg.tickets, 1) > v_event.ticket_capacity THEN
      UPDATE public.event_registrations SET payment_status = 'failed' WHERE id = v_reg.id;
      RETURN jsonb_build_object('ok', false, 'reason', 'not_enough');
    END IF;
  END IF;

  UPDATE public.event_registrations SET payment_status = 'processing' WHERE id = v_reg.id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Only the server (service role) may call these
REVOKE ALL ON FUNCTION public.event_tickets_sold(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_event_registration(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_paypal_registration(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.event_tickets_sold(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_event_registration(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_paypal_registration(text) TO service_role;
