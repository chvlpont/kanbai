"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Create profile entry
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: username,
          email: email,
        },
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
        setError(
          "Account created but profile setup failed. Please contact support."
        );
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/boards");
          router.refresh();
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl shadow-blue-500/10 max-w-md w-full p-8 border border-[#2a2a3e]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-[#9ca3af]">Start organizing with KanbAI</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-md text-sm text-center">
            Account created! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                placeholder="john_doe"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-semibold rounded-md transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-[#9ca3af] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#60a5fa] hover:text-[#3b82f6] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[#9ca3af] hover:text-white text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
