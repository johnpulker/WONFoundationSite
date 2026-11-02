"use client";

import { useState } from "react";
import type { GalleryCategory } from "@/lib/gallery";

function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  try {
    const password = sessionStorage.getItem("admin_password");
    if (password) headers["x-admin-password"] = password;
  } catch {
    // sessionStorage unavailable; cookie session still applies
  }
  return headers;
}

async function readError(response: Response, fallback: string) {
  if (response.status === 401 || response.status === 403) {
    alert("Session expired. Please refresh and log in again.");
    window.location.href = "/admin";
    return null;
  }
  const data = await response.json().catch(() => ({}));
  return (data as { error?: string }).error || fallback;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all";

/**
 * Lets the admin add, rename, reorder and delete gallery categories
 * (the filter buttons on the WONder Women gallery).
 */
export default function GalleryCategoriesManager({
  categories,
  onClose,
  onChanged,
}: {
  categories: GalleryCategory[];
  onClose: () => void;
  /** Called after any change so the parent reloads the list. Receives a newly created category id, if any. */
  onChanged: (createdId?: string) => Promise<void> | void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    run(async () => {
      const response = await fetch("/api/admin/gallery-categories", {
        method: "POST",
        headers: authHeaders(true),
        credentials: "include",
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      if (!response.ok) {
        const message = await readError(response, "Failed to add category");
        if (message) throw new Error(message);
        return;
      }
      const data = await response.json();
      setNewLabel("");
      await onChanged(data.category?.id);
    });
  };

  const handleRename = (id: string) => {
    if (!editLabel.trim()) return;
    run(async () => {
      const response = await fetch("/api/admin/gallery-categories", {
        method: "PUT",
        headers: authHeaders(true),
        credentials: "include",
        body: JSON.stringify({ id, label: editLabel.trim() }),
      });
      if (!response.ok) {
        const message = await readError(response, "Failed to rename category");
        if (message) throw new Error(message);
        return;
      }
      setEditingId(null);
      await onChanged();
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const order = categories.map((c) => c.id);
    [order[index], order[target]] = [order[target], order[index]];
    run(async () => {
      const response = await fetch("/api/admin/gallery-categories", {
        method: "PUT",
        headers: authHeaders(true),
        credentials: "include",
        body: JSON.stringify({ order }),
      });
      if (!response.ok) {
        const message = await readError(response, "Failed to reorder categories");
        if (message) throw new Error(message);
        return;
      }
      await onChanged();
    });
  };

  const handleDelete = (category: GalleryCategory) => {
    if (!confirm(`Delete the "${category.label}" category?`)) return;
    run(async () => {
      const response = await fetch(`/api/admin/gallery-categories?id=${encodeURIComponent(category.id)}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        const message = await readError(response, "Failed to delete category");
        if (message) throw new Error(message);
        return;
      }
      await onChanged();
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-2xl font-heading text-primary">Gallery Categories</h3>
          <p className="text-sm text-neutral-500 mt-1">
            These are the filter buttons on the WONder Women photo gallery. A category only shows on the
            website once it has at least one photo.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAdd} className="space-y-2">
            <label htmlFor="new-category" className="block text-sm font-semibold text-neutral-700">
              Add a category
            </label>
            <div className="flex gap-2">
              <input
                id="new-category"
                type="text"
                maxLength={40}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className={inputClass}
                placeholder={`e.g., ${new Date().getFullYear()} WW`}
              />
              <button
                type="submit"
                disabled={busy || !newLabel.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-neutral-500">New categories are added to the top of the list.</p>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl">
            {categories.length === 0 && (
              <li className="p-4 text-sm text-neutral-500">No categories yet.</li>
            )}
            {categories.map((category, index) => (
              <li key={category.id} className="flex items-center gap-3 p-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={busy || index === 0}
                    className="px-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                    aria-label={`Move ${category.label} up`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={busy || index === categories.length - 1}
                    className="px-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                    aria-label={`Move ${category.label} down`}
                  >
                    ▼
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      maxLength={40}
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRename(category.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className={inputClass}
                      autoFocus
                      aria-label="Category name"
                    />
                  ) : (
                    <>
                      <p className="font-semibold text-neutral-900 truncate">{category.label}</p>
                      <p className="text-xs text-neutral-500">
                        {category.photo_count ?? 0} photo{category.photo_count === 1 ? "" : "s"}
                      </p>
                    </>
                  )}
                </div>

                {editingId === category.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRename(category.id)}
                      disabled={busy || !editLabel.trim()}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#E7C418] text-white hover:bg-[#C9A814] disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 text-neutral-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setEditLabel(category.label);
                      }}
                      disabled={busy}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={busy || (category.photo_count ?? 0) > 0}
                      title={
                        (category.photo_count ?? 0) > 0
                          ? "Move or delete this category's photos before deleting it"
                          : "Delete category"
                      }
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500">
            A category can only be deleted when it has no photos. Renaming keeps all of its photos.
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
