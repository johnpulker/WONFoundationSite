"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  year: number;
  category: string;
  aspect_ratio: 'landscape' | 'portrait' | 'square';
  display_order: number;
}

const categories = [
  { id: "2025-ww", label: "2025 WW" },
  { id: "2024-ww", label: "2024 WW" },
  { id: "2023-ww", label: "2023 WW" },
  { id: "2022-ww", label: "2022 WW" },
  { id: "networking", label: "Networking" },
  { id: "events", label: "Events" },
  { id: "speaker", label: "Speakers" },
];

const aspectRatios = [
  { id: "landscape", label: "Landscape" },
  { id: "portrait", label: "Portrait" },
  { id: "square", label: "Square" },
];

export default function GalleryPhotosView() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{ uploaded: number; total: number; compressing?: number }>({ uploaded: 0, total: 0 });
  const [showBulkUploadYearModal, setShowBulkUploadYearModal] = useState(false);
  const [bulkUploadYear, setBulkUploadYear] = useState(new Date().getFullYear());
  const [bulkUploadCategory, setBulkUploadCategory] = useState('2025-ww');
  const [bulkUploadCaption, setBulkUploadCaption] = useState('');
  const [formData, setFormData] = useState({
    image_url: "",
    caption: "",
    year: new Date().getFullYear(),
    category: "2025-ww",
    aspect_ratio: "landscape" as 'landscape' | 'portrait' | 'square',
    display_order: 0,
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async (page: number = 1) => {
    setLoading(true);
    try {
      // Fetch with pagination - get 100 at a time
      const response = await fetch(`/api/admin/gallery-photos?page=${page}&limit=100`, {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching gallery photos:", response.statusText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch gallery photos');
      }
      
      const data = await response.json();
      
      // If pagination exists and there are more pages, fetch them all
      if (data.pagination && data.pagination.totalPages > 1) {
        const allPhotos = [...(data.photos || [])];
        setLoadingProgress({ current: 1, total: data.pagination.totalPages });
        
        // Fetch remaining pages
        for (let p = 2; p <= data.pagination.totalPages; p++) {
          try {
            setLoadingProgress({ current: p, total: data.pagination.totalPages });
            
            const nextResponse = await fetch(`/api/admin/gallery-photos?page=${p}&limit=100`, {
              credentials: 'include',
            });
            
            if (nextResponse.ok) {
              const nextData = await nextResponse.json();
              allPhotos.push(...(nextData.photos || []));
            } else {
              if (nextResponse.status === 401 || nextResponse.status === 403) {
                alert("Session expired. Please refresh and log in again.");
                window.location.href = '/admin';
                return;
              }
              console.warn(`Failed to fetch page ${p}, continuing with what we have`);
              break;
            }
          } catch (err) {
            console.warn(`Error fetching page ${p}:`, err);
            break; // Stop fetching if we hit an error
          }
        }
        
        setPhotos(allPhotos);
        setLoadingProgress(null);
      } else {
        setPhotos(data.photos || []);
        setLoadingProgress(null);
      }
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Failed to load gallery photos. Please try refreshing the page.");
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

    // Allow up to 2GB for large photo archives
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('File too large. Maximum size is 2GB. Please compress or split the file.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const password = sessionStorage.getItem('admin_password');
      
      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      if (password) {
        headers['x-admin-password'] = password;
      }

      const response = await fetch('/api/admin/upload-gallery-photo', {
        method: 'POST',
        headers,
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload photo');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image_url: data.url }));
      setPhotoPreview(data.url);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      alert(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Compress image before upload
  const compressImage = async (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img') as HTMLImageElement;
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Create a new File object with the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
              const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
              console.log(`[Compress] ${file.name}: ${originalSizeMB} MB → ${compressedSizeMB} MB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`);
              
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const year = bulkUploadYear;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`Some files are not valid image types. Please upload only JPEG, PNG, or WebP images.`);
      return;
    }

    setBulkUploading(true);
    setBulkUploadProgress({ uploaded: 0, total: files.length });

    // Compress all images before uploading
    console.log(`[Bulk Upload] Compressing ${files.length} images...`);
    const compressedFiles: File[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Only compress if file is larger than 1MB
          if (file.size > 1024 * 1024) {
            const compressed = await compressImage(file);
            compressedFiles.push(compressed);
          } else {
            compressedFiles.push(file);
          }
          
          // Update progress during compression
          setBulkUploadProgress({ uploaded: 0, total: files.length, compressing: i + 1 });
        } catch (err) {
          console.error(`[Bulk Upload] Failed to compress ${file.name}:`, err);
          // Use original file if compression fails
          compressedFiles.push(file);
        }
      }
      
      console.log(`[Bulk Upload] Compression complete. Starting upload...`);
    } catch (err) {
      console.error('[Bulk Upload] Error during compression:', err);
      alert('Error compressing images. Using original files.');
      compressedFiles.push(...files);
    }

    try {
      const password = sessionStorage.getItem('admin_password');
      
      console.log(`[Bulk Upload] Starting upload of ${compressedFiles.length} files`);

      // Process files in smaller batches to avoid request body size limits
      const CLIENT_BATCH_SIZE = 3; // Send 3 files at a time
      let totalUploaded = 0;
      let totalErrors: Array<{ fileName: string; error: string }> = [];

      for (let i = 0; i < compressedFiles.length; i += CLIENT_BATCH_SIZE) {
        const batch = compressedFiles.slice(i, i + CLIENT_BATCH_SIZE);
        const batchNumber = Math.floor(i / CLIENT_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(compressedFiles.length / CLIENT_BATCH_SIZE);
        
        // Add a small delay between batches to avoid overwhelming the server
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
        
        console.log(`[Bulk Upload] Sending batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

        // Validate batch before sending
        const invalidFiles = batch.filter(file => {
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          return !validTypes.includes(file.type) || file.size === 0;
        });
        
        if (invalidFiles.length > 0) {
          console.error(`[Bulk Upload] Batch ${batchNumber} has invalid files:`, invalidFiles.map(f => ({
            name: f.name,
            type: f.type,
            size: f.size
          })));
          invalidFiles.forEach(file => {
            totalErrors.push({ 
              fileName: file.name, 
              error: file.size === 0 ? 'File is empty' : `Invalid file type: ${file.type}` 
            });
          });
          continue;
        }

        const formData = new FormData();
        batch.forEach(file => {
          formData.append('files', file);
        });
        formData.append('year', year.toString());
        formData.append('category', bulkUploadCategory);
        formData.append('caption', bulkUploadCaption);
        
        // Log batch details before sending
        console.log(`[Bulk Upload] Batch ${batchNumber} details:`, batch.map(f => ({
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
          type: f.type
        })));

        try {
          const headers: HeadersInit = {};
          if (password) {
            headers['x-admin-password'] = password;
          }

          const response = await fetch('/api/admin/upload-gallery-photos-bulk', {
            method: 'POST',
            headers,
            credentials: 'include', // Include HttpOnly cookie for session validation
            body: formData,
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              alert("Session expired. Please refresh and log in again.");
              window.location.href = '/admin';
              return;
            }
            
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorDetails: any = null;
            
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                errorDetails = data;
                errorMessage = data.error || data.details || data.message || errorMessage;
                console.error(`[Bulk Upload] Batch ${batchNumber} error (${response.status}):`, {
                  status: response.status,
                  statusText: response.statusText,
                  error: data.error,
                  details: data.details,
                  message: data.message,
                  fullData: JSON.stringify(data, null, 2)
                });
              } else {
                const text = await response.text();
                console.error(`[Bulk Upload] Batch ${batchNumber} error (non-JSON, ${response.status}):`, {
                  status: response.status,
                  statusText: response.statusText,
                  contentType,
                  body: text
                });
                errorMessage = text || errorMessage;
              }
            } catch (parseError: any) {
              console.error(`[Bulk Upload] Batch ${batchNumber} error parsing response (${response.status}):`, {
                status: response.status,
                statusText: response.statusText,
                parseError: parseError.message,
                stack: parseError.stack
              });
              // Try to get text as fallback
              try {
                const text = await response.clone().text();
                errorMessage = text || errorMessage;
              } catch (e) {
                // If we can't read the response at all, use status
                errorMessage = `HTTP ${response.status}: ${response.statusText} (Unable to read response body)`;
              }
            }
            
            // Log file details for debugging
            console.error(`[Bulk Upload] Batch ${batchNumber} files:`, batch.map(f => ({
              name: f.name,
              size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
              type: f.type
            })));
            
            // Add all files in this batch as errors with detailed message
            batch.forEach(file => {
              const fileError = errorDetails?.fileName === file.name && errorDetails?.error 
                ? errorDetails.error 
                : errorMessage;
              totalErrors.push({ 
                fileName: file.name, 
                error: `${fileError} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type})` 
              });
            });
            continue;
          }

          const data = await response.json();
          console.log(`[Bulk Upload] Batch ${batchNumber} success:`, data);
          
          totalUploaded += data.uploaded || 0;
          if (data.errors && data.errors.length > 0) {
            totalErrors.push(...data.errors);
          }

          // Update progress
          setBulkUploadProgress({ uploaded: totalUploaded + totalErrors.length, total: files.length });
        } catch (batchError: any) {
          console.error(`[Bulk Upload] Batch ${batchNumber} exception:`, batchError);
          batch.forEach(file => {
            totalErrors.push({ fileName: file.name, error: batchError.message || 'Network error' });
          });
        }
      }

      // Refresh the photos list
      await fetchPhotos();
      
      // Show success message
      if (totalErrors.length > 0) {
        const errorList = totalErrors.slice(0, 10).map(e => `- ${e.fileName}: ${e.error}`).join('\n');
        const moreErrors = totalErrors.length > 10 ? `\n... and ${totalErrors.length - 10} more errors` : '';
        alert(`Uploaded ${totalUploaded} of ${files.length} photos.\n\n${totalErrors.length} failed:\n${errorList}${moreErrors}`);
      } else {
        alert(`Successfully uploaded ${totalUploaded} photos!`);
      }

      // Reset file input
      e.target.value = '';
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      alert(`Failed to upload photos: ${err.message || 'Unknown error'}\n\nCheck the browser console for details.`);
    } finally {
      setBulkUploading(false);
      setBulkUploadProgress({ uploaded: 0, total: 0 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const password = sessionStorage.getItem('admin_password');
      
      const url = editingPhoto
        ? '/api/admin/gallery-photos'
        : '/api/admin/gallery-photos';
      const method = editingPhoto ? 'PUT' : 'POST';

      const body = editingPhoto
        ? { id: editingPhoto.id, ...formData }
        : formData;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (password) {
        headers['x-admin-password'] = password;
      }

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to save photo');
      }

      setShowForm(false);
      setEditingPhoto(null);
      setFormData({
        image_url: "",
        caption: "",
        year: new Date().getFullYear(),
        category: "2025-ww",
        aspect_ratio: "landscape",
        display_order: 0,
      });
      setPhotoPreview(null);
      fetchPhotos();
    } catch (err: any) {
      console.error("Error saving photo:", err);
      alert(err.message || "Failed to save photo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      image_url: photo.image_url,
      caption: photo.caption,
      year: photo.year,
      category: photo.category,
      aspect_ratio: photo.aspect_ratio,
      display_order: photo.display_order,
    });
    setPhotoPreview(photo.image_url);
    setShowForm(true);
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm(`Are you sure you want to delete this photo? This cannot be undone.`)) {
      return;
    }

    try {
      const password = sessionStorage.getItem('admin_password');
      
      const headers: HeadersInit = {};
      if (password) {
        headers['x-admin-password'] = password;
      }

      const response = await fetch(`/api/admin/gallery-photos?id=${photo.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete photo');
      }
      fetchPhotos();
    } catch (err: any) {
      console.error("Error deleting photo:", err);
      alert(err.message || "Failed to delete photo.");
    }
  };

  const handleDeleteAll = async () => {
    if (photos.length === 0) {
      alert('No photos to delete.');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ALL ${photos.length} photos? This action cannot be undone!\n\nThis will permanently delete all photos from the gallery.`
    );

    if (!confirmed) {
      return;
    }

    // Double confirmation for safety
    const doubleConfirmed = confirm(
      `FINAL WARNING: You are about to delete ALL ${photos.length} photos. This cannot be undone. Click OK to proceed.`
    );

    if (!doubleConfirmed) {
      return;
    }

    try {
      const password = sessionStorage.getItem('admin_password');
      
      console.log('[Delete All] Starting delete all request...');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (password) {
        headers['x-admin-password'] = password;
      }
      
      const response = await fetch('/api/admin/gallery-photos/delete-all', {
        method: 'DELETE',
        headers,
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      console.log('[Delete All] Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please refresh and log in again.");
          window.location.href = '/admin';
          return;
        }
        
        let errorMessage = 'Failed to delete all photos';
        try {
          const data = await response.json();
          errorMessage = data.error || data.details || errorMessage;
          console.error('[Delete All] Server error:', data);
        } catch (parseError) {
          const text = await response.text();
          console.error('[Delete All] Non-JSON error response:', text);
          errorMessage = text || `Server returned ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Delete All] Success:', data);
      alert(data.message || `Successfully deleted ${photos.length} photos.`);
      fetchPhotos();
    } catch (err: any) {
      console.error("Error deleting all photos:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        alert("Network error: Could not connect to server. Please check if the server is running and try again.");
      } else {
        alert(err.message || "Failed to delete all photos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin mb-4" />
        {loadingProgress && (
          <p className="text-neutral-600 text-sm">
            Loading photos... {loadingProgress.current} of {loadingProgress.total} pages
          </p>
        )}
        {!loadingProgress && (
          <p className="text-neutral-600 text-sm">Loading photos...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-heading text-neutral-900">Gallery Photos</h2>
          <div className="flex items-center gap-3">
            {/* Bulk Upload Button */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleBulkUpload}
                disabled={bulkUploading}
                multiple
                className="hidden"
                id="bulk-upload"
              />
              <button
                onClick={() => {
                  if (!bulkUploading) {
                    setShowBulkUploadYearModal(true);
                  }
                }}
                disabled={bulkUploading}
                className={`px-6 py-3 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-neutral-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                  bulkUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {bulkUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    {bulkUploadProgress.compressing ? (
                      <span>Compressing {bulkUploadProgress.compressing}/{bulkUploadProgress.total}...</span>
                    ) : (
                      <span>Uploading {bulkUploadProgress.uploaded}/{bulkUploadProgress.total}...</span>
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Bulk Upload
                  </>
                )}
              </button>
            </div>

            {/* Delete All Button */}
            <button
              onClick={handleDeleteAll}
              disabled={photos.length === 0 || bulkUploading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete All
            </button>
            
            {/* Single Photo Button */}
        <button
          onClick={() => {
            setEditingPhoto(null);
            setFormData({
              image_url: "",
              caption: "",
              year: new Date().getFullYear(),
              category: "2025-ww",
              aspect_ratio: "landscape",
              display_order: 0,
            });
            setPhotoPreview(null);
            setShowForm(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Photo
        </button>
          </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-heading text-primary">
                {editingPhoto ? "Edit Gallery Photo" : "Add New Gallery Photo"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Photo *
                </label>
                {photoPreview ? (
                  <div className="relative">
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-neutral-200">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setFormData({ ...formData, image_url: "" });
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploadingPhoto
                          ? 'border-neutral-300 bg-neutral-50'
                          : 'border-neutral-300 hover:border-[#E7C418] hover:bg-[#E7C418]/5'
                      }`}
                    >
                      {uploadingPhoto ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-sm text-neutral-500">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-neutral-600">Click to upload photo</span>
                          <span className="text-xs text-neutral-400 mt-1">JPEG, PNG, or WebP (max 50MB)</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Caption *
                </label>
                <input
                  type="text"
                  required
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  placeholder="e.g., 2025 WONder Women Celebration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max="2100"
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
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Aspect Ratio *
                  </label>
                  <select
                    required
                    value={formData.aspect_ratio}
                    onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value as 'landscape' | 'portrait' | 'square' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  >
                    {aspectRatios.map(ar => (
                      <option key={ar.id} value={ar.id}>{ar.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.image_url}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : editingPhoto ? "Update Photo" : "Add Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Year Selection Modal */}
      {showBulkUploadYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-heading text-primary">
                Bulk Upload Photos
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2100"
                  value={bulkUploadYear}
                  onChange={(e) => setBulkUploadYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                  autoFocus
                />
                <p className="mt-2 text-xs text-neutral-500">
                  All selected photos will be assigned to this year.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={bulkUploadCategory}
                  onChange={(e) => setBulkUploadCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-neutral-500">
                  All selected photos will be assigned to this category.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Caption (Optional)
                </label>
                <textarea
                  value={bulkUploadCaption}
                  onChange={(e) => setBulkUploadCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all resize-none"
                  placeholder="Enter a caption for all photos (e.g., '2025 Wonder Women Awards Ceremony')"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  This caption will be applied to all selected photos. You can edit individual captions later.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUploadYearModal(false);
                    setBulkUploadYear(new Date().getFullYear());
                    setBulkUploadCategory('2025-ww');
                    setBulkUploadCaption('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUploadYearModal(false);
                    // Trigger the file input
                    const fileInput = document.getElementById('bulk-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Select Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-xl">
          <p className="text-neutral-500">No gallery photos yet. Add your first photo to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-200">
              <div className="relative aspect-video">
                <Image
                  src={photo.image_url}
                  alt={photo.caption}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white">
                    {photo.year}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-neutral-900 mb-1 line-clamp-2">{photo.caption}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                  <span className="capitalize">{photo.category}</span>
                  <span>•</span>
                  <span className="capitalize">{photo.aspect_ratio}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="flex-1 px-3 py-2 bg-[#E7C418] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A814] transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(photo)}
                    className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
