import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listEnquiries, type EnquiryStatus } from "@/lib/server/db";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/server/status-labels";
import SegmentedControl from "@/components/admin/SegmentedControl";
import { MobileCardList, MobileEmpty } from "@/components/admin/MobileCards";
import { formatTimestamp } from "@/lib/format-date";
import { EnquiryCard } from "@/components/admin/ListCards";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import ClickableRow from "@/components/admin/ClickableRow";

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-signal/20 text-ink",
  Replied: "bg-emerald-100 text-emerald-800",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await verifyAdminSession();
  const { q = "", status = "" } = await searchParams;

  const all = await listEnquiries();

  const searched = all.filter((enquiry) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return (
      enquiry.name.toLowerCase().includes(needle) ||
      enquiry.phone.toLowerCase().includes(needle) ||
      enquiry.email.toLowerCase().includes(needle)
    );
  });

  // "All" is the default tab (no status in the URL); enquiries still to process come first there
  const effectiveStatus = status || "ALL";
  const filtered =
    effectiveStatus === "ALL"
      ? [...searched].sort((a, b) => Number(b.status === "NEW") - Number(a.status === "NEW"))
      : searched.filter((e) => e.status === effectiveStatus);

  const newCount = searched.filter((e) => e.status === "NEW").length;
  const statusOptions = [
    { value: "ALL", label: "All", count: searched.length },
    ...ENQUIRY_STATUSES.map((s) => ({
      value: s,
      label: ENQUIRY_STATUS_LABELS[s],
      count: searched.filter((e) => e.status === s).length,
      dot: s === "NEW" && newCount > 0,
    })),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Enquiries</h1>
        <span className="hidden font-mono text-xs text-ash md:inline">
          {filtered.length} of {all.length}
        </span>
      </div>

      <div className="mb-3 md:mb-5">
        <SegmentedControl options={statusOptions} />
      </div>

      <div className="mb-3 md:hidden">
        <MobileSearchBar searchHref="/admin/enquiries/search" placeholder="Search name, phone or email" q={q} keep={{ status }} />
      </div>

      <DesktopSearch
        placeholder="Search name, phone, email"
        q={q}
        hidden={{ status }}
        clearHref={status ? `/admin/enquiries?status=${status}` : "/admin/enquiries"}
      />

            <MobileCardList>
        {filtered.length === 0 ? (
          <MobileEmpty>No enquiries found.</MobileEmpty>
        ) : (
          filtered.map((enquiry) => <EnquiryCard key={enquiry.id} enquiry={enquiry} />)
        )}
      </MobileCardList>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center font-mono text-xs text-ash">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              filtered.map((enquiry) => (
                <ClickableRow key={enquiry.id} href={`/admin/enquiries/${enquiry.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-semibold text-ink">{enquiry.name}</div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-ash">
                    {enquiry.message}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {formatTimestamp(enquiry.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] ${STATUS_STYLES[enquiry.status]}`}
                    >
                      {ENQUIRY_STATUS_LABELS[enquiry.status]}
                    </span>
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
