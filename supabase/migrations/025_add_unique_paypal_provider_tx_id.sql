-- Prevent duplicate PayPal transaction records across all payment types.
-- This enforces server-side idempotency even if the frontend retries requests.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paypal_provider_tx_id_unique
  ON public.payments(provider_tx_id)
  WHERE provider = 'paypal' AND provider_tx_id IS NOT NULL;
