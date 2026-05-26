"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  bio: string;
  job_title: string;
  organization: string;
  show_email_public: boolean;
  show_phone_public: boolean;
  show_in_directory: boolean;
  linkedin_url: string;
  website_url: string;
}

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) => (
  <div className={span === 2 ? "md:col-span-2" : ""}>
    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({
    phone: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "",
    bio: "", job_title: "", organization: "", show_email_public: false, show_phone_public: false,
    show_in_directory: true, linkedin_url: "", website_url: "",
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();

      if (userData) {
        setUser(userData);
        setFirstName(userData.first_name || "");
        setLastName(userData.last_name || "");
        setImageError(false); // Reset error state when user data changes
      }
      if (profileData) {
        setProfile({
          phone: profileData.phone || "", address_line1: profileData.address_line1 || "",
          address_line2: profileData.address_line2 || "", city: profileData.city || "",
          state: profileData.state || "", postal_code: profileData.postal_code || "",
          bio: profileData.bio || "", job_title: profileData.job_title || "",
          organization: profileData.organization || "", show_email_public: profileData.show_email_public || false,
          show_phone_public: profileData.show_phone_public || false,
          show_in_directory: profileData.show_in_directory ?? true,
          linkedin_url: profileData.linkedin_url || "", website_url: profileData.website_url || "",
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      await supabase.from("users").update({
        first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`,
      }).eq("id", user.id);
      await supabase.from("profiles").upsert({ id: user.id, ...profile });
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a JPEG, PNG, or WebP image.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExtension}`;
      
      // Upload to Supabase Storage (using folder structure: user-id/filename)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        // Provide more specific error messages
        if (uploadError.message?.includes('new row violates row-level security')) {
          throw new Error('Storage permissions not configured. Please contact support.');
        } else if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else {
          throw new Error(uploadError.message || 'Failed to upload photo. Error: ' + JSON.stringify(uploadError));
        }
      }

      if (!uploadData) {
        throw new Error('Upload succeeded but no data returned');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      // Update user record with photo URL
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_photo_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update profile photo');
      }

      await fetchProfile();
      setMessage({ type: 'success', text: 'Photo updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload photo. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-500">Loading...</div>;
  }

  const inputClass = isEditing 
    ? "w-full px-4 py-2.5 text-sm border border-neutral-300 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
    : "w-full px-4 py-2.5 text-sm border border-neutral-200 bg-neutral-50 text-neutral-600 rounded-lg transition-colors";

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Your Profile</h2>
          <p className="text-sm text-neutral-500">Manage your personal information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information" description="Your name and profile photo">
        <div className="flex items-start gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {user?.profile_photo_url && !imageError ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  firstName?.[0]?.toUpperCase() || "?"
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                </button>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,image/webp" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </div>
          </div>
          
          {/* Name Fields */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Field label="First Name">
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} className={inputClass} />
            </Field>
            <Field label="Last Name">
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} className={inputClass} />
            </Field>
            <Field label="Email" span={2}>
              <input type="email" value={user?.email || ""} disabled className={`${inputClass} bg-neutral-100`} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Professional */}
      <Section title="Professional Details" description="Your work information visible to other members">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Job Title">
            <input type="text" value={profile.job_title} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} disabled={!isEditing} placeholder="e.g., City Council Member" className={inputClass} />
          </Field>
          <Field label="Organization">
            <input type="text" value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} disabled={!isEditing} placeholder="e.g., City of Detroit" className={inputClass} />
          </Field>
          <Field label="Bio" span={2}>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} disabled={!isEditing} rows={4} placeholder="Tell other members about yourself, your experience, and interests..." className={`${inputClass} resize-none`} />
          </Field>
          <Field label="LinkedIn URL">
            <input type="url" value={profile.linkedin_url} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} disabled={!isEditing} placeholder="https://linkedin.com/in/yourname" className={inputClass} />
          </Field>
          <Field label="Website">
            <input type="url" value={profile.website_url} onChange={(e) => setProfile({ ...profile, website_url: e.target.value })} disabled={!isEditing} placeholder="https://yourwebsite.com" className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Information" description="Your private contact details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone">
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} placeholder="(555) 123-4567" className={inputClass} />
          </Field>
          <Field label="Street Address">
            <input type="text" value={profile.address_line1} onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })} disabled={!isEditing} placeholder="123 Main Street" className={inputClass} />
          </Field>
          <Field label="City">
            <input type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} disabled={!isEditing} placeholder="Detroit" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <input type="text" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} disabled={!isEditing} placeholder="MI" className={inputClass} />
            </Field>
            <Field label="ZIP Code">
              <input type="text" value={profile.postal_code} onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })} disabled={!isEditing} placeholder="48201" className={inputClass} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Directory Settings */}
      <Section title="Directory Visibility" description="Control what other members can see about you">
        <div className="space-y-4">
          {[
            { key: 'show_in_directory', label: 'Show my profile in the member directory', desc: 'Other members can discover your profile' },
            { key: 'show_email_public', label: 'Display my email address', desc: 'Your email will be visible to other members' },
            { key: 'show_phone_public', label: 'Display my phone number', desc: 'Your phone will be visible to other members' },
          ].map((item, i) => (
            <label key={item.key} className={`flex items-center justify-between py-3 cursor-pointer ${i > 0 ? 'border-t border-neutral-100' : ''}`}>
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={profile[item.key as keyof Profile] as boolean}
                  onChange={(e) => setProfile({ ...profile, [item.key]: e.target.checked })}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  isEditing ? 'peer-checked:bg-primary bg-neutral-300' : 'bg-neutral-200'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    profile[item.key as keyof Profile] ? 'translate-x-4' : ''
                  }`} />
                </div>
              </div>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
