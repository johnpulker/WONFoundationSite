"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface BoardMember {
  id: string;
  name: string;
  role: string | null;
  category: 'officer' | 'director' | 'nominating_committee';
  profession: string | null;
  bio: string | null;
  bio_url: string | null;
  photo_url: string | null;
}

export default function BoardMemberPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [member, setMember] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewAllBoardMembers = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/about');
    // Wait for navigation, then scroll to board section
    setTimeout(() => {
      const boardSection = document.getElementById('board');
      if (boardSection) {
        const offset = 96; // Account for sticky nav
        const elementPosition = boardSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 500);
  };


  useEffect(() => {
    async function fetchMember() {
      try {
        const response = await fetch(`/api/board-members/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Board member not found");
          } else {
            setError("Failed to load board member");
          }
          return;
        }
        const data = await response.json();
        setMember(data.member);
      } catch (err) {
        console.error('Error fetching board member:', err);
        setError("Failed to load board member");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchMember();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-white">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center">
          <h1 className="text-3xl font-heading text-primary mb-4">Board Member Not Found</h1>
          <Link href="/about#board" className="text-[#E7C418] hover:underline">
            Return to Board Directory
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'officer': return 'Officer';
      case 'director': return 'Director';
      case 'nominating_committee': return 'Nominating Committee Member';
      default: return 'Board Member';
    }
  };

  const getRoleColor = (role: string | null) => {
    if (!role) return "from-[#E7C418] to-[#C9A814]";
    if (role.toLowerCase().includes("president") || role.toLowerCase().includes("ceo")) {
      return "from-[#871c1c] to-[#a02323]";
    }
    return "from-[#E7C418] to-[#C9A814]";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf8f5] to-[#f6f3ef]">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div 
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: 'url(/goldenvines.png)',
            backgroundSize: 'auto',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/about#board"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Board Directory</span>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100"
        >
          {/* Header Section with Gradient */}
          <div className={`relative bg-gradient-to-br ${getRoleColor(member.role)} p-8 md:p-12`}>
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 2px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Photo */}
              <div className="flex-shrink-0">
                {member.photo_url ? (
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-8 ring-white/20 shadow-2xl">
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 192px, 256px"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/20 flex items-center justify-center ring-8 ring-white/20 shadow-2xl">
                    <span className="text-white text-6xl font-heading font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <span className="text-white text-sm font-semibold uppercase tracking-wide">
                    {getCategoryLabel(member.category)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
                  {member.name}
                </h1>
                {member.role && (
                  <div className={`inline-block px-6 py-3 bg-white rounded-full shadow-lg mb-4`}>
                    <span className="text-[#871c1c] font-semibold text-lg">
                      {member.role}
                    </span>
                  </div>
                )}
                {member.profession && (
                  <p className="text-white/90 text-lg italic font-light">
                    {member.profession}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {member.bio && (
            <div className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto">
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#E7C418]" />
                  <div className="w-2 h-2 rounded-full bg-[#E7C418]" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#E7C418]" />
                </div>

                {/* Bio Text */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-neutral-700 leading-relaxed text-lg whitespace-pre-line">
                    {member.bio}
                  </p>
                </div>

                {/* Optional Full Bio Link */}
                {member.bio_url && (
                  <div className="mt-8 pt-8 border-t border-neutral-200">
                    <a
                      href={member.bio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <span>Read Full Bio</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Accent */}
          <div className={`h-2 bg-gradient-to-r ${getRoleColor(member.role)}`} />
        </motion.div>

        {/* Related Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link
            href="/about#board"
            onClick={handleViewAllBoardMembers}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-neutral-200 hover:border-[#E7C418] group"
          >
            <svg className="w-5 h-5 text-[#871c1c] group-hover:text-[#E7C418] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold text-neutral-700 group-hover:text-[#871c1c] transition-colors">
              View All Board Members
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

