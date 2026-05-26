"use client";

import { useState, useEffect } from "react";

interface Honoree {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  year: number;
  honoree_order: number;
}

export default function HonoreesView() {
  const [honorees, setHonorees] = useState<Honoree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHonoree, setEditingHonoree] = useState<Honoree | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photo_url: "",
    year: new Date().getFullYear(),
    honoree_order: 1,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchHonorees();
  }, []);

  const fetchHonorees = async () => {
    try {
      const response = await fetch('/api/admin/honorees', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching honorees:", response.statusText);
        return;
      }

      const data = await response.json();
      setHonorees(data.honorees || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const honoreeData = {
        id: editingHonoree?.id,
        name: formData.name,
        title: formData.title || null,
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
        year: formData.year,
        honoree_order: formData.honoree_order,
      };

      const response = await fetch('/api/admin/honorees', {
        method: editingHonoree ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify(honoreeData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save honoree');
      }

      // Reset form and refresh
      setShowForm(false);
      setEditingHonoree(null);
      setFormData({
        name: "",
        title: "",
        bio: "",
        photo_url: "",
        year: new Date().getFullYear(),
        honoree_order: 1,
      });
      setPhotoPreview(null);
      fetchHonorees();
    } catch (err: any) {
      console.error("Error saving honoree:", err);
      alert(err.message || "Failed to save honoree. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (honoree: Honoree) => {
    setEditingHonoree(honoree);
    setFormData({
      name: honoree.name,
      title: honoree.title || "",
      bio: honoree.bio || "",
      photo_url: honoree.photo_url || "",
      year: honoree.year,
      honoree_order: honoree.honoree_order,
    });
    setPhotoPreview(honoree.photo_url);
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-honoree-photo', {
        method: 'POST',
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload photo');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, photo_url: data.url }));
      setPhotoPreview(data.url);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      alert(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async (honoree: Honoree) => {
    if (!confirm(`Are you sure you want to delete "${honoree.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/honorees?id=${honoree.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete honoree');
      }
      fetchHonorees();
    } catch (err: any) {
      console.error("Error deleting honoree:", err);
      alert(err.message || "Failed to delete honoree.");
    }
  };

  // Group honorees by year
  const honoreesByYear = honorees.reduce((acc, h) => {
    if (!acc[h.year]) acc[h.year] = [];
    acc[h.year].push(h);
    return acc;
  }, {} as Record<number, Honoree[]>);

  const years = Object.keys(honoreesByYear).map(Number).sort((a, b) => b - a);

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
        <h2 className="text-3xl font-heading text-neutral-900">WONder Women Honorees</h2>
        <button
          onClick={() => {
            setEditingHonoree(null);
            setFormData({
              name: "",
              title: "",
              bio: "",
              photo_url: "",
              year: new Date().getFullYear(),
              honoree_order: 1,
            });
            setPhotoPreview(null);
            setShowForm(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Honoree
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-heading text-primary">
                {editingHonoree ? "Edit Honoree" : "Add New Honoree"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Title / Work
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., CEO, Community Leader, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all resize-none"
                  placeholder="Brief biography of the honoree..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Photo
                </label>
                
                {/* Photo Preview */}
                {photoPreview && (
                  <div className="mb-4">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-200"
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block w-full">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#E7C418] transition-colors cursor-pointer flex items-center justify-center gap-2">
                      {uploadingPhoto ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
                          <span className="text-neutral-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-neutral-600">Click to upload photo</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Or enter URL manually */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Or enter photo URL manually:
                  </label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => {
                      setFormData({ ...formData, photo_url: e.target.value });
                      setPhotoPreview(e.target.value || null);
                    }}
                    className="w-full px-4 py-2 rounded-lg border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all text-sm"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Upload a JPEG, PNG, or WebP image (max 5MB), or enter a URL.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1987"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.honoree_order}
                    onChange={(e) => setFormData({ ...formData, honoree_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHonoree(null);
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
                      {editingHonoree ? "Update Honoree" : "Add Honoree"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Honorees List by Year */}
      {years.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading text-neutral-900 mb-1">No honorees yet</h3>
          <p className="text-neutral-500 text-sm mb-4">
            Add your first honoree to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#871c1c] to-[#a02323] px-6 py-4">
                <h3 className="text-2xl font-heading text-white">{year} WONder Women</h3>
                <p className="text-white/80 text-sm">{honoreesByYear[year].length} honoree{honoreesByYear[year].length !== 1 ? 's' : ''}</p>
      </div>
              
              <div className="p-6">
        <div className="space-y-4">
                  {honoreesByYear[year]
                    .sort((a, b) => a.honoree_order - b.honoree_order)
                    .map((honoree) => (
            <div
              key={honoree.id}
                        className="border border-neutral-200 rounded-xl p-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors"
                      >
                        {honoree.photo_url ? (
                          <img
                            src={honoree.photo_url}
                            alt={honoree.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#871c1c] to-[#a02323] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xl font-heading font-bold">
                              {honoree.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-neutral-900 mb-1">{honoree.name}</h4>
                          {honoree.title && (
                            <p className="text-sm text-neutral-600 mb-2 italic">{honoree.title}</p>
                          )}
                          {honoree.bio && (
                            <p className="text-sm text-neutral-600 line-clamp-2">{honoree.bio}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-2">Order: {honoree.honoree_order}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(honoree)}
                            className="p-2 text-neutral-500 hover:text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(honoree)}
                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
