"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("seller@boat-lifestyle.in");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent, demo = false) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, demo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-amazon-dark text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,153,0,0.18), transparent 45%)",
          }}
        />
        <div className="relative z-10">
          <div className="text-xl font-bold">
            amazon<span className="text-amazon-orange">.in</span>{" "}
            <span className="text-sm font-normal text-gray-300 ml-1">Seller Central</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Returns, decided <span className="text-amazon-orange">on time</span>
            <br />— every time.
          </h1>
          <p className="text-gray-300 max-w-md">
            Review return requests, approve or reject with a reason, and let the SLA engine
            auto-approve anything left unattended for 48 hours. Every decision is logged for
            customer support.
          </p>
          <div className="flex gap-10 pt-2">
            <div>
              <div className="text-2xl font-bold">48h</div>
              <div className="text-xs text-gray-400">SLA window</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-gray-400">Decisions logged</div>
            </div>
            <div>
              <div className="text-2xl font-bold">75%</div>
              <div className="text-xs text-gray-400">Avg. within SLA</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amazon-orange" /> Request raised
            <span className="w-8 h-px bg-gray-600" />
            <span className="w-2 h-2 rounded-full bg-amazon-orange" /> Seller reviews
            <span className="w-8 h-px bg-gray-600" />
            <span className="w-2 h-2 rounded-full bg-amazon-orange" /> Decision logged
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Amazon India. All rights reserved.
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <form
          onSubmit={(e) => submit(e, false)}
          className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-xl font-bold">Seller sign in</h2>
          <p className="text-sm text-gray-500 mt-1">
            Access the Returns Dashboard for your seller account.
          </p>

          <label className="block text-sm font-medium mt-6">Email or Seller ID</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />

          <label className="block text-sm font-medium mt-4">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-amazon-orange hover:brightness-95 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition"
          >
            {loading ? "Signing in…" : "Sign in to Seller Central"}
          </button>

          <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex-1 h-px bg-gray-200" /> DEMO ACCESS
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={(e) => submit(e, true)}
            disabled={loading}
            className="mt-4 w-full border border-gray-300 hover:bg-gray-50 disabled:opacity-60 font-medium rounded-lg py-2.5 text-sm transition"
          >
            Continue as Seller One →
          </button>

          <p className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
            <span className="font-semibold">Demo note:</span> seeded credentials sign you in as{" "}
            <span className="font-semibold">Seller One (IN123456)</span> so you can explore the
            Returns Dashboard and Customer Support View. Email:{" "}
            <span className="font-mono">seller@boat-lifestyle.in</span> / Password:{" "}
            <span className="font-mono">demo1234</span>
          </p>
        </form>
      </div>
    </div>
  );
}
