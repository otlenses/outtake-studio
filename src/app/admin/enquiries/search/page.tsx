import { verifyAdminSession } from "@/lib/server/dal";
import { listEnquiries } from "@/lib/server/db";
import SearchShell from "@/components/admin/SearchShell";
import { EnquiryCard } from "@/components/admin/ListCards";

export default async function EnquirySearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle
    ? (await listEnquiries()).filter(
        (e) =>
          e.name.toLowerCase().includes(needle) ||
          e.phone.toLowerCase().includes(needle) ||
          e.email.toLowerCase().includes(needle) ||
          e.message.toLowerCase().includes(needle)
      )
    : [];

  return (
    <SearchShell
      placeholder="Name, phone, email or message"
      q={q}
      hint="You can search by name, phone, email or message"
      parent="/admin/enquiries"
      count={results.length}
    >
      <ul className="flex flex-col gap-3">
        {results.map((e) => (
          <EnquiryCard key={e.id} enquiry={e} />
        ))}
      </ul>
    </SearchShell>
  );
}
