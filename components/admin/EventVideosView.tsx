"use client";

import { useState, useEffect } from "react";

interface EventVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  event_date: string | null;
  year: number;
  is_active: boolean;
  video_order: number;
  created_at: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    // Handle youtu.be short links
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`

    // Handle full youtube.com URLs
    const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (fullMatch) return `https://www.youtube.com/embed/${fullMatch[1]}`

    // Handle embed URLs passed directly
    if (url.includes('youtube.com/embed/')) return url

    return null
  } catch {
    return null
  }
}

function getYouTubeThumbnail(url: string): string | null {
  try {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`

    const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (fullMatch) return `https://img.youtube.com/vi/${fullMatch[1]}/hqdefault.jpg`

    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`

    return null
  } catch {
    return null
  }
}

export default function EventVideosView() {
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<EventVideo | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewEmbed, setPreviewEmbed] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    event_date: "",
    year: new Date().getFullYear(),
    is_active: true,
    video_order: 1,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  // Live URL preview
  useEffect(() => {
    setPreviewEmbed(getYouTubeEmbedUrl(formData.youtube_url));
  }, [formData.youtube_url]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/event-videos', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching event videos:", response.statusText);
        return;
      }
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getYouTubeEmbedUrl(formData.youtube_url)) {
      alert("Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: editingVideo?.id,
        title: formData.title,
        description: formData.description || null,
        youtube_url: formData.youtube_url,
        event_date: formData.event_date || null,
        year: formData.year,
        is_active: formData.is_active,
        video_order: formData.video_order,
      };

      const response = await fetch('/api/admin/event-videos', {
        method: editingVideo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save video');
      }

      resetForm();
      fetchVideos();
    } catch (err: any) {
      alert(err.message || "Failed to save video. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (video: EventVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      youtube_url: video.youtube_url,
      event_date: video.event_date || "",
      year: video.year,
      is_active: video.is_active,
      video_order: video.video_order,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (video: EventVideo) => {
    try {
      const response = await fetch('/api/admin/event-videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: video.id, is_active: !video.is_active }),
      });
      if (!response.ok) throw new Error('Failed to toggle');
      fetchVideos();
    } catch (err) {
      alert("Failed to update video status.");
    }
  };

  const handleDelete = async (video: EventVideo) => {
    if (!confirm(`Delete "${video.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/admin/event-videos?id=${video.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }
      fetchVideos();
    } catch (err: any) {
      alert(err.message || "Failed to delete video.");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setPreviewEmbed(null);
    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      event_date: "",
      year: new Date().getFullYear(),
      is_active: true,
      video_order: 1,
    });
  };

  // Group videos by year for display
  const videosByYear = videos.reduce<Record<number, EventVideo[]>>((acc, v) => {
    if (!acc[v.year]) acc[v.year] = [];
    acc[v.year].push(v);
    return acc;
  }, {});
  const sortedYears = Object.keys(videosByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Event Videos</h2>
          <p className="text-neutral-500 text-sm mt-1">Manage YouTube videos displayed on the Programs &amp; Events page.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#871c1c] text-white rounded-lg text-sm font-medium hover:bg-[#6b1515] transition-colors"
          >
            + Add Video
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-5">
            {editingVideo ? "Edit Video" : "Add New Video"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 2025 Annual Breakfast Highlights"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                YouTube URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Paste the full YouTube video URL. Standard watch links and short youtu.be links both work.
              </p>
            </div>

            {/* Live embed preview */}
            {previewEmbed && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Preview</p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100">
                  <iframe
                    src={previewEmbed}
                    title="YouTube preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
            {formData.youtube_url && !previewEmbed && (
              <p className="text-sm text-red-600">
                ⚠ Could not parse a valid YouTube video ID from this URL. Please check the link.
              </p>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event or video..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c] resize-none"
              />
            </div>

            {/* Year / Date / Order row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Year <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min={2000}
                  max={2099}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Event Date (optional)</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={formData.video_order}
                  onChange={(e) => setFormData({ ...formData, video_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
                />
                <p className="text-xs text-neutral-500 mt-1">Lower = shown first within the same year.</p>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-neutral-700">
                {formData.is_active ? 'Visible on website' : 'Hidden from website'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#871c1c] text-white rounded-lg text-sm font-medium hover:bg-[#6b1515] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editingVideo ? 'Save Changes' : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Video List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium">No videos yet</p>
          <p className="text-neutral-400 text-sm mt-1">Click &quot;Add Video&quot; to add your first event video.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-1">{year}</h3>
              <div className="space-y-3">
                {videosByYear[year].map((video) => {
                  const thumbnail = getYouTubeThumbnail(video.youtube_url);
                  return (
                    <div
                      key={video.id}
                      className={`bg-white border rounded-xl p-4 flex gap-4 items-start transition-opacity ${
                        video.is_active ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-neutral-100">
                        {thumbnail ? (
                          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="font-semibold text-neutral-900 text-sm">{video.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            video.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {video.is_active ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{video.description}</p>
                        )}
                        {video.event_date && (
                          <p className="text-xs text-neutral-400 mt-1">
                            {new Date(video.event_date + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 mt-1 truncate">{video.youtube_url}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(video)}
                          title={video.is_active ? 'Hide from website' : 'Show on website'}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                        >
                          {video.is_active ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(video)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
