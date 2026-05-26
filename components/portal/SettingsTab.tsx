"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsTab() {
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) throw updateError;

      setSuccess("Password updated successfully!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h2 className="text-2xl font-heading text-neutral-900 mb-6">Change Password</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handlePasswordChange}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-heading text-neutral-900 mb-4">Account Information</h2>
        <p className="text-neutral-600 mb-6">
          To update your email or other account details, please visit your Profile tab.
        </p>
        
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-neutral-900 mb-2">Need Help?</h3>
          <p className="text-sm text-neutral-600">
            If you need to make changes to your account that aren&apos;t available here, 
            please contact us at{" "}
            <a href="mailto:administrator@wonfoundation.net" className="text-primary hover:underline">
              administrator@wonfoundation.net
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
