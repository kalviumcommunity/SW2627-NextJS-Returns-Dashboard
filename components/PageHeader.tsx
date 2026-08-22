"use client";

import Topbar from "@/components/Topbar";
import { useSession } from "@/lib/useSession";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const session = useSession();
  return (
    <Topbar
      title={title}
      subtitle={subtitle}
      sellerName={session?.name ?? "…"}
      sellerCode={session?.sellerCode ?? "…"}
    />
  );
}
