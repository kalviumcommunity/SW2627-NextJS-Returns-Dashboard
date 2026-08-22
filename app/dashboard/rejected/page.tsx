import ReturnsList from "@/components/ReturnsList";

export default function RejectedPage() {
  return (
    <ReturnsList
      title="Rejected"
      subtitle="Returns you rejected, with reasons"
      status="REJECTED"
    />
  );
}
