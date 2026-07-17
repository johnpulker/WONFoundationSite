"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";

interface Member {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  role: string;
  created_at: string;
  notes: string | null;
  profile: {
    phone: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    address_line1: string | null;
    address_line2: string | null;
    job_title: string | null;
    organization: string | null;
    occupation: string | null;
    bio: string | null;
    show_in_directory: boolean;
    show_email_public: boolean;
    show_phone_public: boolean;
    linkedin_url: string | null;
    website_url: string | null;
  } | null;
  membership: {
    level: string;
    status: string;
    start_date: string;
    end_date: string;
    is_complimentary?: boolean;
  } | null;
}

export default function MembersView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    postal_code: "",
    address_line1: "",
    address_line2: "",
    job_title: "",
    organization: "",
    occupation: "",
    bio: "",
    show_in_directory: true,
    show_email_public: false,
    show_phone_public: false,
    linkedin_url: "",
    website_url: "",
    membership_level: "",
    membership_status: "pending",
    is_complimentary: false,
    membership_expiration_date: "",
    notes: "",
    skip_welcome_email: false,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/members', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/admin';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    const name = member.full_name?.toLowerCase() || `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email?.toLowerCase() || "";
    return name.includes(term) || email.includes(term);
  });

  // Helper function to parse date string as local date (not UTC)
  const parseLocalDate = (dateString: string): Date => {
    // Check if it's a date-only string (YYYY-MM-DD) or a full timestamp
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Date-only string - parse as local date
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    // Full timestamp - use as is
    return new Date(dateString);
  };

  const formatDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSave = async () => {
    if (!selectedMember && !isCreating) return;

    setSaving(true);
    setError(null);

    try {
      const url = '/api/admin/members';
      const method = isCreating ? 'POST' : 'PUT';
      const body = isCreating 
        ? editFormData 
        : { id: selectedMember!.id, ...editFormData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isCreating ? 'create' : 'update'} member`);
      }

      const data = await response.json();
      
      if (isCreating) {
        // Add new member to list
        setMembers([data.member, ...members]);
        setIsCreating(false);
        setSelectedMember(null);
        // Reset form
        setEditFormData({
          full_name: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          city: "",
          state: "",
          postal_code: "",
          address_line1: "",
          address_line2: "",
          job_title: "",
          organization: "",
          occupation: "",
          bio: "",
          show_in_directory: true,
          show_email_public: false,
          show_phone_public: false,
          linkedin_url: "",
          website_url: "",
          membership_level: "",
          membership_status: "pending",
          is_complimentary: false,
          membership_expiration_date: "",
          notes: "",
          skip_welcome_email: false,
        });
      } else {
        // Update the member in the list
        setMembers(members.map(m => m.id === selectedMember!.id ? data.member : m));
        setSelectedMember(data.member);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "First Name", "Last Name", "Email", "Phone",
      "Job Title", "Organization", "Occupation",
      "Address Line 1", "Address Line 2", "City", "State", "Postal Code",
      "Membership Level", "Membership Status", "Membership Start", "Membership End", "Complimentary",
      "In Directory", "Show Email Public", "Show Phone Public",
      "LinkedIn", "Website", "Joined",
    ];

    const escape = (val: any) => {
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const rows = members.map((m) => [
      m.first_name,
      m.last_name,
      m.email,
      m.profile?.phone ?? "",
      m.profile?.job_title ?? "",
      m.profile?.organization ?? "",
      m.profile?.occupation ?? "",
      m.profile?.address_line1 ?? "",
      m.profile?.address_line2 ?? "",
      m.profile?.city ?? "",
      m.profile?.state ?? "",
      m.profile?.postal_code ?? "",
      m.membership?.level ?? "",
      m.membership?.status ?? "",
      m.membership?.start_date ?? "",
      m.membership?.end_date ?? "",
      m.membership?.is_complimentary ? "Yes" : "No",
      m.profile?.show_in_directory ? "Yes" : "No",
      m.profile?.show_email_public ? "Yes" : "No",
      m.profile?.show_phone_public ? "Yes" : "No",
      m.profile?.linkedin_url ?? "",
      m.profile?.website_url ?? "",
      m.created_at ? new Date(m.created_at).toLocaleDateString("en-US") : "",
    ].map(escape).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `won-members-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to delete "${memberName}"? This action cannot be undone and will delete their account, profile, and all associated data.`)) {
      return;
    }

    setDeleting(memberId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/members?id=${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete member');
      }

      // Remove member from list
      setMembers(members.filter(m => m.id !== memberId));
      
      // Close modal if deleting the selected member
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600">Loading members...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-heading text-neutral-900">Members</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExportCSV}>
              Export Members List
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsCreating(true);
                setIsEditing(true);
                setSelectedMember(null);
                setEditFormData({
                  full_name: "",
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  city: "",
                  state: "",
                  postal_code: "",
                  address_line1: "",
                  address_line2: "",
                  job_title: "",
                  organization: "",
                  occupation: "",
                  bio: "",
                  show_in_directory: true,
                  show_email_public: false,
                  show_phone_public: false,
                  linkedin_url: "",
                  website_url: "",
                  membership_level: "",
                  membership_status: "pending",
                  is_complimentary: false,
                  membership_expiration_date: "2027-06-30",
                  notes: "",
                  skip_welcome_email: false,
                });
              }}
            >
              Add Member
            </Button>
            <Button variant="secondary" onClick={fetchMembers}>
              Refresh
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        <p className="text-sm text-neutral-600 mt-2">
          Total: {members.length} members | Showing: {filteredMembers.length}
        </p>
      </div>
      
      <Card className="p-6">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-neutral-600">
            {members.length === 0 ? "No members registered yet." : "No members match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Directory</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                          {member.profile_photo_url ? (
                            <img 
                              src={member.profile_photo_url} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {member.first_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">
                            {member.first_name} {member.last_name}
                          </div>
                          {member.profile?.job_title && (
                            <div className="text-xs text-neutral-500">
                              {member.profile.job_title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{member.email}</td>
                    <td className="py-3 px-4 text-neutral-700">
                      {member.profile?.city && member.profile?.state
                        ? `${member.profile.city}, ${member.profile.state}`
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.profile?.show_in_directory
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {member.profile?.show_in_directory ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditing(false);
                            setIsCreating(false);
                            // Populate form data
                            setEditFormData({
                              full_name: member.full_name || "",
                              first_name: member.first_name || "",
                              last_name: member.last_name || "",
                              email: member.email || "",
                              phone: member.profile?.phone || "",
                              city: member.profile?.city || "",
                              state: member.profile?.state || "",
                              postal_code: member.profile?.postal_code || "",
                              address_line1: member.profile?.address_line1 || "",
                              address_line2: member.profile?.address_line2 || "",
                              job_title: member.profile?.job_title || "",
                              organization: member.profile?.organization || "",
                              occupation: member.profile?.occupation || "",
                              bio: member.profile?.bio || "",
                              show_in_directory: member.profile?.show_in_directory ?? true,
                              show_email_public: member.profile?.show_email_public ?? false,
                              show_phone_public: member.profile?.show_phone_public ?? false,
                              linkedin_url: member.profile?.linkedin_url || "",
                              website_url: member.profile?.website_url || "",
                              membership_level: member.membership?.level || "",
                              membership_status: member.membership?.status || "pending",
                              is_complimentary: member.membership?.is_complimentary || false,
                              membership_expiration_date: member.membership?.end_date
                                ? member.membership.end_date.split('T')[0]
                                : "2027-06-30",
                              notes: member.notes || "",
                              skip_welcome_email: false,
                            });
                          }}
                          className="text-primary hover:underline text-sm"
                        >
                          View/Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.full_name || member.email)}
                          disabled={deleting === member.id}
                          className="text-red-600 hover:underline text-sm disabled:opacity-50"
                        >
                          {deleting === member.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!selectedMember || isCreating}
        onClose={() => {
          setSelectedMember(null);
          setIsEditing(false);
          setIsCreating(false);
        }}
        title={isCreating ? "Add New Member" : (isEditing ? "Edit Member" : "Member Details")}
        size="lg"
      >
        {(selectedMember || isCreating) && (
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {!isEditing && !isCreating && selectedMember ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                    {selectedMember.profile_photo_url ? (
                      <img 
                        src={selectedMember.profile_photo_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {selectedMember.first_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h3>
                    <p className="text-neutral-600">{selectedMember.email}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Role:</span>
                    <span className="ml-2 text-neutral-900 capitalize">{selectedMember.role}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Membership:</span>
                    <span className="ml-2 text-neutral-900">
                      {selectedMember.membership 
                        ? `${selectedMember.membership.level}${selectedMember.membership.is_complimentary ? ' (comp)' : ''} (${selectedMember.membership.status})`
                        : "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Joined:</span>
                    <span className="ml-2 text-neutral-900">{formatDate(selectedMember.created_at)}</span>
                  </div>
                  {selectedMember.membership && (
                    <div>
                      <span className="text-neutral-500">Membership Expires:</span>
                      <span className="ml-2 text-neutral-900">{formatDate(selectedMember.membership.end_date)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-500">Phone:</span>
                    <span className="ml-2 text-neutral-900">{selectedMember.profile?.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Location:</span>
                    <span className="ml-2 text-neutral-900">
                      {selectedMember.profile?.city && selectedMember.profile?.state
                        ? `${selectedMember.profile.city}, ${selectedMember.profile.state}`
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Job Title:</span>
                    <span className="ml-2 text-neutral-900">{selectedMember.profile?.job_title || "-"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Organization:</span>
                    <span className="ml-2 text-neutral-900">{selectedMember.profile?.organization || "-"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Occupation:</span>
                    <span className="ml-2 text-neutral-900">{selectedMember.profile?.occupation || "-"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">In Directory:</span>
                    <span className={`ml-2 ${selectedMember.profile?.show_in_directory ? "text-green-600" : "text-neutral-600"}`}>
                      {selectedMember.profile?.show_in_directory ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Bio Section */}
                {selectedMember.profile?.bio && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-500 mb-2">Bio</h4>
                    <p className="text-neutral-700 whitespace-pre-wrap">{selectedMember.profile.bio}</p>
                  </div>
                )}

                {/* Admin Notes Section */}
                {selectedMember.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-500 mb-2">Admin Notes</h4>
                    <p className="text-neutral-700 whitespace-pre-wrap bg-yellow-50 border border-yellow-200 rounded-lg p-3">{selectedMember.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t border-neutral-200">
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(selectedMember.id, selectedMember.full_name || selectedMember.email)}
                    disabled={deleting === selectedMember.id}
                  >
                    {deleting === selectedMember.id ? 'Deleting...' : 'Delete Member'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Member
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.first_name}
                        onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.last_name}
                        onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {isCreating && (
                      <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.skip_welcome_email}
                            onChange={(e) => setEditFormData({ ...editFormData, skip_welcome_email: e.target.checked })}
                            className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-neutral-700">
                            Don&apos;t send welcome email
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Membership Level {isCreating && "(Optional)"}
                    </label>
                    <select
                      value={editFormData.membership_level}
                      onChange={(e) => {
                        const newLevel = e.target.value;
                        setEditFormData({ 
                          ...editFormData, 
                          membership_level: newLevel,
                          // Reset complimentary flag when membership level is cleared
                          is_complimentary: newLevel ? editFormData.is_complimentary : false
                        });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">No Membership</option>
                      <option value="General">General Membership ($35)</option>
                      <option value="Sustaining">Sustaining Membership ($100)</option>
                      <option value="Youth">Youth Membership ($10)</option>
                    </select>
                    {editFormData.membership_level && (
                      <>
                        <div className="mt-3">
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Membership Status
                          </label>
                          <select
                            value={editFormData.membership_status}
                            onChange={(e) => setEditFormData({ ...editFormData, membership_status: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                          </select>
                          <p className="text-xs text-neutral-500 mt-1">
                            Set to Active once check payment is received, or to confirm a manually added membership.
                          </p>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Membership Expiration Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={editFormData.membership_expiration_date}
                            onChange={(e) => setEditFormData({ ...editFormData, membership_expiration_date: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <p className="text-xs text-neutral-500 mt-1">
                            If not specified, expiration will be calculated automatically based on registration date.
                          </p>
                        </div>
                        <div className="mt-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.is_complimentary}
                              onChange={(e) => setEditFormData({ ...editFormData, is_complimentary: e.target.checked })}
                              className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-neutral-700">
                              Complimentary (won&apos;t count toward revenue)
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                    {isCreating && editFormData.membership_level && (
                      <p className="text-xs text-neutral-500 mt-1">
                        If selected, a membership will be created and a welcome email will be sent to the member.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={editFormData.state}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={editFormData.postal_code}
                        onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={editFormData.address_line1}
                      onChange={(e) => setEditFormData({ ...editFormData, address_line1: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={editFormData.address_line2}
                      onChange={(e) => setEditFormData({ ...editFormData, address_line2: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={editFormData.job_title}
                        onChange={(e) => setEditFormData({ ...editFormData, job_title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={editFormData.organization}
                        onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={editFormData.occupation}
                      onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Enter member biography..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={editFormData.linkedin_url}
                        onChange={(e) => setEditFormData({ ...editFormData, linkedin_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={editFormData.website_url}
                        onChange={(e) => setEditFormData({ ...editFormData, website_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_in_directory"
                        checked={editFormData.show_in_directory}
                        onChange={(e) => setEditFormData({ ...editFormData, show_in_directory: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="show_in_directory" className="text-sm font-medium text-neutral-700">
                        Show in Directory
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_email_public"
                        checked={editFormData.show_email_public}
                        onChange={(e) => setEditFormData({ ...editFormData, show_email_public: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="show_email_public" className="text-sm font-medium text-neutral-700">
                        Show Email Publicly
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_phone_public"
                        checked={editFormData.show_phone_public}
                        onChange={(e) => setEditFormData({ ...editFormData, show_phone_public: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="show_phone_public" className="text-sm font-medium text-neutral-700">
                        Show Phone Publicly
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Admin Notes <span className="text-xs text-neutral-500 font-normal">(Not visible to member)</span>
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-yellow-300 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
                      placeholder="e.g., Vegan Only, Special accommodations needed..."
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Internal notes for admin use only. Members cannot see this information.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setSelectedMember(null);
                      // Reset form data
                      setEditFormData({
                        full_name: "",
                        first_name: "",
                        last_name: "",
                        email: "",
                        phone: "",
                        city: "",
                        state: "",
                        postal_code: "",
                        address_line1: "",
                        address_line2: "",
                        job_title: "",
                        organization: "",
                        occupation: "",
                        bio: "",
                        show_in_directory: true,
                        show_email_public: false,
                        show_phone_public: false,
                        linkedin_url: "",
                        website_url: "",
                        membership_level: "",
                        membership_status: "pending",
                        is_complimentary: false,
                        membership_expiration_date: "",
                        notes: "",
                        skip_welcome_email: false,
                      });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (isCreating ? "Creating..." : "Saving...") : (isCreating ? "Create Member" : "Save Changes")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
