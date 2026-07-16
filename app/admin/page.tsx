"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardView from "@/components/admin/DashboardView";
import MembersView from "@/components/admin/MembersView";
import EventsView from "@/components/admin/EventsView";
import HonoreesView from "@/components/admin/HonoreesView";
import PaymentsView from "@/components/admin/PaymentsView";
import BoardMembersView from "@/components/admin/BoardMembersView";
import GalleryPhotosView from "@/components/admin/GalleryPhotosView";
import EventVideosView from "@/components/admin/EventVideosView";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
// Removed client-side session management - now using server-side HttpOnly cookies

const views = [
  { id: "dashboard", label: "Dashboard" },
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
  { id: "honorees", label: "Honorees" },
  { id: "board", label: "Board of Directors" },
  { id: "gallery", label: "Gallery Photos" },
  { id: "event-videos", label: "Event Videos" },
  { id: "payments", label: "Payments" },
];

export default function AdminPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if session is valid by making a server-side validation request
    // Server validates the HttpOnly cookie
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/validate-session", {
          method: "GET",
          credentials: "include", // Include cookies
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setPassword("");
      router.push("/admin");
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout even if API call fails
      setIsAuthenticated(false);
      setPassword("");
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Validate password using the auth endpoint
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: Include cookies
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Authentication failed";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // If response is not JSON, use status-based message
          if (response.status === 401) {
            errorMessage = "Invalid password";
          } else if (response.status === 429) {
            errorMessage = "Too many login attempts. Please try again later.";
          } else if (response.status === 500) {
            errorMessage = "Server error. Please check server logs.";
          }
        }
        setError(errorMessage);
        return;
      }

      // Password is valid - server creates HttpOnly cookie session
      // Cookie is set automatically, no client-side storage needed
      setIsAuthenticated(true);
      setPassword(""); // Clear password from state
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center py-12">
        <Card className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">Admin Access</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button onClick={handleLogin} disabled={loading} className="w-full bg-black text-white hover:bg-neutral-800">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 p-6 flex flex-col">
        <h1 className="text-2xl font-heading text-primary mb-8">Admin Console</h1>
        <nav className="space-y-2 flex-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`w-full text-left px-4 py-3 rounded-button transition-colors ${
                activeView === view.id
                  ? "bg-primary text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {view.label}
            </button>
          ))}
          <Link
            href="/admin/registrations"
            className="block w-full text-left px-4 py-3 rounded-button transition-colors text-neutral-700 hover:bg-neutral-100 border-t border-neutral-200 mt-4 pt-4"
          >
            Event Registrations
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-button transition-colors text-red-600 hover:bg-red-50 border-t border-neutral-200 mt-4"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "members" && <MembersView />}
        {activeView === "events" && <EventsView />}
        {activeView === "honorees" && <HonoreesView />}
        {activeView === "board" && <BoardMembersView />}
        {activeView === "gallery" && <GalleryPhotosView />}
        {activeView === "event-videos" && <EventVideosView />}
        {activeView === "payments" && <PaymentsView />}
      </main>
    </div>
  );
}








