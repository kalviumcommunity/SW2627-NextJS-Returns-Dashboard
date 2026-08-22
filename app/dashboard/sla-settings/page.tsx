"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function SlaSettingsPage() {
  const [windowHours, setWindowHours] = useState(48);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sla-settings")
      .then((r) => r.json())
      .then((data) => setWindowHours(data.windowHours ?? 48))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch("/api/sla-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ windowHours }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Couldn't save. Please try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="SLA Settings"
        subtitle="Configure how long a return can stay pending before it's auto-approved"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <label className="block text-sm font-semibold mb-2">
              Auto-approval window (hours)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              If a return request sits without an Approve or Reject decision for this long, the
              SLA engine will automatically approve it and log the decision as taken by{" "}
              <span className="font-medium">System</span>. This applies to new return requests
              going forward — it does not change deadlines already set for existing pending
              returns.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={720}
                value={windowHours}
                onChange={(e) => setWindowHours(Number(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            {saved && <p className="text-sm text-green-600 mt-3">Saved.</p>}

            <button
              onClick={save}
              disabled={saving}
              className="mt-5 bg-amazon-orange hover:brightness-95 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
