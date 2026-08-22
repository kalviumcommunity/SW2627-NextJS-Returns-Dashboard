import ReturnsList from "@/components/ReturnsList";

export default function AutoApprovedPage() {
  return (
    <ReturnsList
      title="Auto-Approved"
      subtitle="Returns approved automatically after the SLA window elapsed"
      status="AUTO_APPROVED"
    />
  );
}
