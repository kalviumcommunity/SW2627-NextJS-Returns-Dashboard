"use client";

import PageHeader from "@/components/PageHeader";
import { useSession } from "@/lib/useSession";

export default function ProfilePage() {
  const session = useSession();

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your Seller Central account" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amazon-orange text-white flex items-center justify-center text-xl font-bold">
            {session?.name?.[0] ?? "?"}
          </div>
          <div>
            <div className="font-bold text-lg">{session?.name ?? "Loading…"}</div>
            <div className="text-sm text-gray-500">Seller ID: {session?.sellerCode ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
