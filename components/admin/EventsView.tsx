"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  date: string;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  price_cents: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  registration_count?: number;
  total_tickets?: number;
}

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    date: "",
    time: "18:00",
    venue_name: "",
    venue_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    price_cents: 0,
    is_active: true,
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Use admin API to bypass RLS and get registration counts
      const response = await fetch('/api/admin/events', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching events:", response.statusText);
        return;
      }

      const data = await response.json();
      setEvents((data.events || []).map((e: any) => ({
        ...e,
        image_url: e.image_url || null,
      })));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + new Date().getFullYear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const eventData = {
        id: editingEvent?.id,
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        date: dateTime,
        venue_name: formData.venue_name || null,
        venue_address: formData.venue_address || null,
        city: formData.city || null,
        state: formData.state || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        price_cents: formData.price_cents,
        is_active: formData.is_active,
        image_url: formData.image_url || null,
        use_external_registration: false,
        external_registration_url: null,
      };

      const response = await fetch('/api/admin/events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save event');
      }

      // Reset form and refresh
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        date: "",
        time: "18:00",
        venue_name: "",
        venue_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        price_cents: 0,
        is_active: true,
        image_url: "",
        use_external_registration: false,
        external_registration_url: "",
      });
      fetchEvents();
    } catch (err: any) {
      console.error("Error saving event:", err);
      alert(err.message || "Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    const eventDate = new Date(event.date);
    setEditingEvent(event);
    setFormData({
      name: event.name,
      slug: event.slug,
      description: event.description || "",
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toTimeString().slice(0, 5),
      venue_name: event.venue_name || "",
      venue_address: event.venue_address || "",
      city: event.city || "",
      state: event.state || "",
      postal_code: event.postal_code || "",
      country: event.country || "",
      price_cents: event.price_cents,
      is_active: event.is_active,
      image_url: event.image_url || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const password = sessionStorage.getItem('admin_password');
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      if (editingEvent?.id) {
        uploadFormData.append('eventId', editingEvent.id);
      }

      const headers: HeadersInit = {};
      if (password) {
        headers['x-admin-password'] = password;
      }

      const response = await fetch('/api/admin/upload-event-photo', {
        method: 'POST',
        headers,
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: uploadFormData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleActive = async (event: Event) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify({
          id: event.id,
          is_active: !event.is_active,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle event');
      fetchEvents();
    } catch (err) {
      console.error("Error toggling event:", err);
    }
  };

  const handleDelete = async (event: Event) => {
    const registrationCount = event.registration_count || 0;
    const warningMessage = registrationCount > 0
      ? `Are you sure you want to delete "${event.name}"? This will also delete ${registrationCount} registration(s) associated with this event. This action cannot be undone.`
      : `Are you sure you want to delete "${event.name}"? This cannot be undone.`;
    
    if (!confirm(warningMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events?id=${event.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }
      fetchEvents();
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert(err.message || "Failed to delete event. It may have registrations.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-heading text-neutral-900">Events</h2>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              name: "",
              slug: "",
              description: "",
              date: "",
              time: "18:00",
              venue_name: "",
              venue_address: "",
              city: "",
              state: "",
              postal_code: "",
              country: "",
              price_cents: 0,
              is_active: true,
              image_url: "",
              use_external_registration: false,
              external_registration_url: "",
            });
            setShowForm(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-heading text-primary">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., Leadership Development Workshop"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., leadership-workshop-2025"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {`This will be used in the event URL: /events/${formData.slug || "your-slug"}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all resize-none"
                  placeholder="Describe the event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., Lawrence Technology University"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue_address}
                  onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., 123 Main Street"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This address will be used for Google Maps integration
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                    placeholder="e.g., Southfield"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                    placeholder="e.g., MI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                    placeholder="e.g., 48201"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                    placeholder="e.g., United States"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Ticket Price (in dollars)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_cents / 100}
                    onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                    placeholder="0.00 for free events"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Set to $0 for free events
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Event Image
                </label>
                <div className="space-y-3">
                  {formData.image_url && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-neutral-200">
                      <img
                        src={formData.image_url}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="px-4 py-3 border-2 border-dashed border-neutral-300 rounded-xl hover:border-[#871c1c] transition-colors text-center">
                        {uploadingImage ? (
                          <span className="text-sm text-neutral-600">Uploading...</span>
                        ) : (
                          <span className="text-sm text-neutral-600">
                            {formData.image_url ? "Replace Image" : "Upload Image"}
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Upload an image for this event. Image will appear in the top right corner of event cards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-300 text-[#871c1c] focus:ring-[#E7C418]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
                  Event is active and visible on the website
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 py-3 px-6 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingEvent ? "Update Event" : "Create Event"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading text-neutral-900 mb-1">No events yet</h3>
            <p className="text-neutral-500 text-sm mb-4">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Event</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Registrations</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {events.map((event) => {
                  const isPast = new Date(event.date) < new Date();
                  return (
                    <tr key={event.id} className={`hover:bg-neutral-50 transition-colors ${isPast ? "opacity-60" : ""}`}>
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <p className="font-semibold text-neutral-900 truncate">{event.name}</p>
                          <p className="text-xs text-neutral-500 truncate">/events/{event.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(event.date).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {event.venue_name || event.city || "TBD"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${event.price_cents > 0 ? "text-[#E7C418]" : "text-green-600"}`}>
                          {event.price_cents > 0 ? `$${(event.price_cents / 100).toFixed(2)}` : "Free"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#871c1c]/10 text-[#871c1c]">
                            {event.registration_count || 0} {event.registration_count === 1 ? 'registration' : 'registrations'}
                          </span>
                          {(event.total_tickets || 0) > (event.registration_count || 0) && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7C418]/10 text-[#C9A814]">
                              {event.total_tickets} tickets
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(event)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            event.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                          }`}
                        >
                          {event.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 text-neutral-500 hover:text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <a
                            href={`/events/${event.slug?.replace(/^events\//, '') || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-500 hover:text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            onClick={() => window.open(`/api/admin/events/${event.id}/download-registrants`, '_blank')}
                            className="p-2 text-neutral-500 hover:text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors"
                            title="Download Registrant PDF"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
