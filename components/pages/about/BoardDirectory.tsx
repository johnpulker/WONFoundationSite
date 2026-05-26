"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function BoardDirectory() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/board-members/list');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error fetching board members:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const getTitleColor = (role: string | null) => {
    if (!role) return "bg-accent/20 text-primary";
    const roleLower = role.toLowerCase();
    if (roleLower.includes("president") || roleLower.includes("ceo") || roleLower.includes("secretary") || roleLower.includes("treasurer")) {
      return "bg-primary text-white";
    }
    return "bg-accent/20 text-primary";
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
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Top Flourish */}
        <div className="flex justify-center mb-6">
          <svg className="w-12 h-12 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          </svg>
        </div>

        {/* Section Header */}
        <div className="mb-12">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
              Leadership
            </span>
          </div>
          <div className="h-[1px] w-20 bg-accent mb-6"></div>
          <h2 className="text-5xl md:text-6xl font-heading text-primary mb-10 leading-tight font-bold">
            Board of Directors
          </h2>
        </div>

        {/* Members by Category */}
        {categories.map((category, catIndex) => {
          const categoryMembers = (membersByCategory[category] || [])
            .sort((a, b) => a.display_order - b.display_order);

          if (categoryMembers.length === 0) return null;

          return (
            <div key={category} className={catIndex > 0 ? "mt-16" : ""}>
              <h3 className="text-2xl font-heading text-primary mb-8 pb-4 border-b-2 border-accent/30">
                {categoryLabels[category]}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
                  >
                    <Link
                      href={member.slug ? `/board/${member.slug}` : '#'}
                      className="block h-full"
                      onClick={(e) => {
                        if (!member.slug || member.is_vacant) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="relative h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-primary/30 group">
                        {/* Photo Section */}
                        <div className="relative aspect-[4/5] bg-gradient-to-br from-primary/20 via-primary/10 to-neutral-100 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent z-10"></div>
                          
                          {member.photo_url ? (
                            <Image
                              src={member.photo_url}
                              alt={member.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                              <div className="w-28 h-28 rounded-full bg-primary/25 flex items-center justify-center">
                                <svg className="w-14 h-14 text-primary/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          
                          {/* Title Badge - Only show for officers */}
                          {member.category === 'officer' && (
                            <div className={`absolute bottom-4 left-4 right-4 z-20 ${getTitleColor(member.role)} px-4 py-2 rounded-lg text-sm font-semibold text-center shadow-md`}>
                              {member.is_vacant ? `VACANT - ${member.role}` : member.role}
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          <h3 className="text-xl font-heading text-primary mb-2 leading-tight group-hover:text-primary-dark transition-colors">
                            {member.is_vacant ? 'Vacant' : member.name}
                          </h3>
                          {member.profession && !member.is_vacant && (
                            <p className="text-sm text-neutral-600 mb-3 italic line-clamp-2">
                              {member.profession}
                            </p>
                          )}
                          
                          {!member.is_vacant && member.slug && (
                            <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                              <span>View Profile</span>
                              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {members.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#871c1c]/10 to-[#E7C418]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading text-primary mb-2">No Board Members Yet</h3>
            <p className="text-neutral-600">Board member information will be available soon.</p>
          </div>
        )}
      </motion.div>

    </>
  );
}
