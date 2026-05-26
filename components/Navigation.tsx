"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs-events", label: "Programs & Events" },
  { href: "/membership", label: "Membership" },
  { href: "/directory", label: "Directory" },
  { href: "/wonder-women", label: "WONder Women" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20 md:h-24 min-h-[5rem] gap-8">
          {/* Logo - Visual mark only, premium whitespace */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <Image 
              src="/newWonLogo.png" 
              alt="WON Foundation" 
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation - More whitespace */}
          <div className="hidden xl:flex items-center space-x-2 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-button text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-neutral-200">
                <Link
                  href="/portal"
                  className={`px-4 py-3 rounded-button text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === "/portal"
                      ? "text-primary bg-primary/10"
                      : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                  }`}
                >
                  My Portal
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-4 py-2 rounded-button text-sm font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  {loggingOut ? "..." : "Logout"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-5 py-2.5 rounded-button text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Tablet Navigation - Show fewer items, more spacing */}
          <div className="hidden md:flex xl:hidden items-center space-x-3 flex-shrink-0">
            {navItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-button text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                  }`}
                >
                  {item.label.length > 12 ? item.label.split(' ')[0] : item.label}
                </Link>
              );
            })}
            
            {/* User indicator for tablet */}
            {user && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button text-neutral-700 hover:bg-neutral-100"
              aria-label="More menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button text-neutral-700 hover:bg-neutral-100 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t border-neutral-200 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-4 space-y-1">
                {/* On mobile, show all items. On tablet, show only items not in the top bar */}
                {(isTablet ? navItems.slice(4) : navItems).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2 rounded-button text-base font-medium ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                
                {/* Auth section in mobile menu */}
                <div className="border-t border-neutral-200 mt-2 pt-2">
                  {user ? (
                    <>
                      <Link
                        href="/portal"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2 rounded-button text-base font-medium ${
                          pathname === "/portal"
                            ? "text-primary bg-primary/10"
                            : "text-neutral-700 hover:text-primary hover:bg-neutral-100"
                        }`}
                      >
                        My Portal
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        disabled={loggingOut}
                        className="w-full text-left px-4 py-2 rounded-button text-base font-medium text-red-600 hover:bg-red-50"
                      >
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-button text-base font-medium text-primary hover:bg-primary/10"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
