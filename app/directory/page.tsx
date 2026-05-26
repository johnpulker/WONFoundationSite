"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface DirectoryMember {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_photo_url: string | null;
  profile: {
    job_title: string | null;
    organization: string | null;
    bio: string | null;
    phone: string | null;
    show_email_public: boolean;
    show_phone_public: boolean;
    linkedin_url: string | null;
    website_url: string | null;
  } | null;
}

const alphabetGroups = [
  { label: "A-B", letters: ["A", "B"] },
  { label: "C-D", letters: ["C", "D"] },
  { label: "E-F", letters: ["E", "F"] },
  { label: "G-H", letters: ["G", "H"] },
  { label: "I-J", letters: ["I", "J"] },
  { label: "K-L", letters: ["K", "L"] },
  { label: "M-N", letters: ["M", "N"] },
  { label: "O-P", letters: ["O", "P"] },
  { label: "Q-R", letters: ["Q", "R"] },
  { label: "S-T", letters: ["S", "T"] },
  { label: "U-V", letters: ["U", "V"] },
  { label: "W-Z", letters: ["W", "X", "Y", "Z"] },
];

export default function DirectoryPage() {
  const router = useRouter();
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Fetch users who are visible in directory
      const { data, error: fetchError } = await supabase
        .from("users")
        .select(`
          id,
          first_name,
          last_name,
          full_name,
          email,
          profile_photo_url,
          profile:profiles!inner(
            job_title,
            organization,
            bio,
            phone,
            show_email_public,
            show_phone_public,
            linkedin_url,
            website_url,
            show_in_directory
          )
        `)
        .order("last_name", { ascending: true });

      if (fetchError) throw fetchError;

      // Transform and filter to only show members who opted into directory
      const directoryMembers = (data || [])
        .map((member: any) => ({
          ...member,
          // Supabase returns profile as array, take first element
          profile: Array.isArray(member.profile) ? member.profile[0] : member.profile
        }))
        .filter((member: any) => member.profile?.show_in_directory === true);

      setMembers(directoryMembers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthAndFetch = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      await fetchMembers();
    } catch (err) {
      router.push("/login");
    }
  }, [router, fetchMembers]);

  const filterMembers = useCallback(() => {
    let filtered = members;

    // Filter by alphabet group
    if (activeFilter) {
      const group = alphabetGroups.find((g) => g.label === activeFilter);
      if (group) {
        filtered = filtered.filter((member) => {
          const lastName = member.last_name || member.full_name || "";
          const firstLetter = lastName.charAt(0).toUpperCase();
          return group.letters.includes(firstLetter);
        });
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((member) => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const org = member.profile?.organization?.toLowerCase() || "";
        const title = member.profile?.job_title?.toLowerCase() || "";
        return fullName.includes(term) || org.includes(term) || title.includes(term);
      });
    }

    setFilteredMembers(filtered);
  }, [members, activeFilter, searchTerm]);

  useEffect(() => {
    checkAuthAndFetch();
  }, [checkAuthAndFetch]);

  useEffect(() => {
    filterMembers();
  }, [filterMembers]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-neutral-600">Loading directory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white py-16">
        <div className="absolute inset-0 bg-[url('/imgs/womancape.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">Member Directory</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Connect with fellow WON members. Members are listed alphabetically by last name.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, organization, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Alphabet Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === null
                  ? "bg-primary text-white shadow-md"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              All
            </button>
            {alphabetGroups.map((group) => (
              <button
                key={group.label}
                onClick={() => setActiveFilter(group.label)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === group.label
                    ? "bg-primary text-white shadow-md"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <Card className="p-6 bg-red-50 border-red-200 mb-8">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <p className="text-neutral-600 mb-6">
          Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          {activeFilter && ` with last names starting with ${activeFilter}`}
        </p>

        {filteredMembers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-neutral-600">
              {searchTerm || activeFilter
                ? "No members found matching your search."
                : "No members in the directory yet."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={() => setSelectedMember(member)}
              >
                <div className="text-center">
                  {/* Photo */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                    {member.profile_photo_url ? (
                      <img
                        src={member.profile_photo_url}
                        alt={member.full_name || `${member.first_name} ${member.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {member.first_name?.[0]?.toUpperCase() || member.last_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                    {member.first_name} {member.last_name}
                  </h3>

                  {/* Job Title & Organization */}
                  {(member.profile?.job_title || member.profile?.organization) && (
                    <p className="text-sm text-neutral-600 mt-1">
                      {member.profile?.job_title}
                      {member.profile?.job_title && member.profile?.organization && " at "}
                      {member.profile?.organization}
                    </p>
                  )}

                  {/* Public Contact Info */}
                  <div className="mt-3 space-y-1">
                    {member.profile?.show_email_public && member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary hover:underline block"
                      >
                        {member.email}
                      </a>
                    )}
                    {member.profile?.show_phone_public && member.profile?.phone && (
                      <a
                        href={`tel:${member.profile.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-neutral-600 block"
                      >
                        {member.profile.phone}
                      </a>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-primary font-medium">View Profile →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with photo */}
            <div className="relative bg-gradient-to-r from-primary to-primary/80 p-8 text-white text-center rounded-t-2xl">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-28 h-28 mx-auto rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30 mb-4">
                {selectedMember.profile_photo_url ? (
                  <img
                    src={selectedMember.profile_photo_url}
                    alt={selectedMember.full_name || `${selectedMember.first_name} ${selectedMember.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold">
                    {selectedMember.first_name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-heading">
                {selectedMember.first_name} {selectedMember.last_name}
              </h2>
              {(selectedMember.profile?.job_title || selectedMember.profile?.organization) && (
                <p className="text-white/90 mt-1">
                  {selectedMember.profile?.job_title}
                  {selectedMember.profile?.job_title && selectedMember.profile?.organization && " at "}
                  {selectedMember.profile?.organization}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Bio */}
              {selectedMember.profile?.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">About</h3>
                  <p className="text-neutral-700">{selectedMember.profile.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              {(selectedMember.profile?.show_email_public || selectedMember.profile?.show_phone_public) && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Contact</h3>
                  <div className="space-y-2">
                    {selectedMember.profile?.show_email_public && selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="flex items-center text-primary hover:underline"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedMember.email}
                      </a>
                    )}
                    {selectedMember.profile?.show_phone_public && selectedMember.profile?.phone && (
                      <a
                        href={`tel:${selectedMember.profile.phone}`}
                        className="flex items-center text-neutral-700 hover:text-primary"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedMember.profile.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(selectedMember.profile?.linkedin_url || selectedMember.profile?.website_url) && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Links</h3>
                  <div className="flex gap-3">
                    {selectedMember.profile?.linkedin_url && (
                      <a
                        href={selectedMember.profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006097] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {selectedMember.profile?.website_url && (
                      <a
                        href={selectedMember.profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

