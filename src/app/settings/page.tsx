"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            ...formData,
            name: userData.name || "",
            email: userData.email || "",
          });
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white hover:bg-white/20 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-white/60 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl glass ${
              message.type === "success" ? "border-l-4 border-green-400" : "border-l-4 border-red-400"
            }`}
          >
            <p className={message.type === "success" ? "text-green-400" : "text-red-400"}>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:scale-105 transition-transform"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:scale-105 transition-transform"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account Information
            </h2>
            <div className="space-y-3 text-white/70">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span>Account Created</span>
                <span className="text-white/90">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span>Last Updated</span>
                <span className="text-white/90">
                  {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Account ID</span>
                <span className="text-white/90">#{user?.id || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
