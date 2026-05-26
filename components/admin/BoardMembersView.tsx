"use client";

import { useState, useEffect } from "react";

interface BoardMember {
  id: string;
  name: string;
  role: string | null;
  category: 'officer' | 'director' | 'nominating_committee';
  profession: string | null;
  bio: string | null;
  bio_url: string | null;
  photo_url: string | null;
  slug: string | null;
  display_order: number;
  is_vacant: boolean;
}

const categoryLabels = {
  officer: 'Officers',
  director: 'Director Members',
  nominating_committee: 'Nominating Committee Members',
};

export default function BoardMembersView() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "officer" as BoardMember['category'],
    profession: "",
    bio: "",
    bio_url: "",
    photo_url: "",
    slug: "",
    display_order: 1,
    is_vacant: false,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/board-members', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching board members:", response.statusText);
        return;
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-board-photo', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const memberData = {
        id: editingMember?.id,
        name: formData.name,
        role: formData.role,
        category: formData.category,
        profession: formData.profession || null,
        bio: formData.bio || null,
        bio_url: formData.bio_url || null,
        photo_url: formData.photo_url || null,
        slug: formData.slug || generateSlug(formData.name),
        display_order: formData.display_order,
        is_vacant: formData.is_vacant,
      };

      const response = await fetch('/api/admin/board-members', {
        method: editingMember ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save board member');
      }

      setShowForm(false);
      setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        category: "officer",
        profession: "",
        bio: "",
        bio_url: "",
        photo_url: "",
        slug: "",
        display_order: 1,
        is_vacant: false,
      });
      setPhotoPreview(null);
      fetchMembers();
    } catch (err: any) {
      console.error("Error saving board member:", err);
      alert(err.message || "Failed to save board member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: BoardMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role || "",
      category: member.category,
      profession: member.profession || "",
      bio: member.bio || "",
      bio_url: member.bio_url || "",
      photo_url: member.photo_url || "",
      slug: member.slug || generateSlug(member.name),
      display_order: member.display_order,
      is_vacant: member.is_vacant,
    });
    setPhotoPreview(member.photo_url);
    setShowForm(true);
  };

  const handleDelete = async (member: BoardMember) => {
    if (!confirm(`Are you sure you want to delete "${member.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/board-members?id=${member.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete board member');
      }
      fetchMembers();
    } catch (err: any) {
      console.error("Error deleting board member:", err);
      alert(err.message || "Failed to delete board member.");
    }
  };

  // Group members by category
  const membersByCategory = members.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, BoardMember[]>);

  const categories: BoardMember['category'][] = ['officer', 'director', 'nominating_committee'];

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
        <h2 className="text-3xl font-heading text-neutral-900">Board of Directors</h2>
        <button
          onClick={() => {
            setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        category: "officer",
        profession: "",
        bio: "",
        bio_url: "",
        photo_url: "",
        slug: "",
        display_order: 1,
        is_vacant: false,
      });
            setPhotoPreview(null);
            setShowForm(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Board Member
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-heading text-primary">
                {editingMember ? "Edit Board Member" : "Add New Board Member"}
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
                  placeholder="e.g., Janice Berry"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Role/Title {formData.category === 'officer' ? '*' : '(Optional - only for Officers)'}
                </label>
                <input
                  type="text"
                  required={formData.category === 'officer'}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., President, Vice President, Development, Secretary, etc."
                />
                {formData.category !== 'officer' && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Director Members and Nominating Committee Members don&apos;t need roles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as BoardMember['category'] })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                >
                  <option value="officer">Officers</option>
                  <option value="director">Director Members</option>
                  <option value="nominating_committee">Nominating Committee Members</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., Real estate professional and local government leader"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bio *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all resize-none"
                  placeholder="Enter the board member's full biography. This will be displayed on their individual page."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This bio will be displayed on the board member&apos;s individual page at /board/[slug]
                </p>
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
                  placeholder="e.g., janice-berry"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This will be used in the URL: /board/{formData.slug || "their-name"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Link to Full Bio (Optional)
                </label>
                <input
                  type="url"
                  value={formData.bio_url}
                  onChange={(e) => setFormData({ ...formData, bio_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="https://example.com/full-bio (optional)"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Optional: Link to a longer bio page if the brief bio above isn&apos;t enough
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Photo
                </label>
                
                {photoPreview && (
                  <div className="mb-4">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-200"
                    />
                  </div>
                )}

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
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="is_vacant"
                    checked={formData.is_vacant}
                    onChange={(e) => setFormData({ ...formData, is_vacant: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-[#871c1c] focus:ring-[#E7C418]"
                  />
                  <label htmlFor="is_vacant" className="ml-3 text-sm font-medium text-neutral-700">
                    This is a vacant position
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
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
                      {editingMember ? "Update Member" : "Add Member"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List by Category */}
      {categories.map((category) => {
        const categoryMembers = membersByCategory[category] || [];
        if (categoryMembers.length === 0 && !loading) return null;

        return (
          <div key={category} className="mb-8 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#871c1c] to-[#a02323] px-6 py-4">
              <h3 className="text-2xl font-heading text-white">{categoryLabels[category]}</h3>
              <p className="text-white/80 text-sm">{categoryMembers.length} member{categoryMembers.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {categoryMembers
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="border border-neutral-200 rounded-xl p-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors"
                    >
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#871c1c] to-[#a02323] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-heading font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 mb-1">
                              {member.name}
                              {member.is_vacant && (
                                <span className="ml-2 text-xs text-neutral-500 italic">(Vacant)</span>
                              )}
                            </h4>
                            {member.role && (
                              <p className="text-sm text-[#871c1c] font-medium mb-1">{member.role}</p>
                            )}
                            {member.profession && (
                              <p className="text-sm text-neutral-600 mb-2">{member.profession}</p>
                            )}
                            {member.slug && (
                              <a
                                href={`/board/${member.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#E7C418] hover:underline mt-1 block"
                              >
                                View Page →
                              </a>
                            )}
                            {member.bio_url && (
                              <a
                                href={member.bio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-neutral-500 hover:underline mt-1 block"
                              >
                                External Bio Link →
                              </a>
                            )}
                            <p className="text-xs text-neutral-500 mt-2">Order: {member.display_order}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-neutral-500 hover:text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      })}

      {members.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading text-neutral-900 mb-1">No board members yet</h3>
          <p className="text-neutral-500 text-sm mb-4">
            Add your first board member to get started.
          </p>
        </div>
      )}
    </div>
  );
}

