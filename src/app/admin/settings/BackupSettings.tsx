import { listOrders, listMerchOrders, listEnquiries } from "@/lib/server/db";

/** Settings -> Backup: one button that downloads all the data as a file. */
export default async function BackupSettings() {
  const [orders, merchOrders, enquiries] = await Promise.all([listOrders(), listMerchOrders(), listEnquiries()]);

  return (
    <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
      <h2 className="mb-2 text-lg font-bold text-ink">Download a backup</h2>
      <p className="text-sm text-ink/70">
        Saves a copy of everything you can see in this admin to your computer: products, packages, merchandise,
        portfolio, banners, settings, and all orders and enquiries.
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          ["Order requests", orders.length],
          ["Merch orders", merchOrders.length],
          ["Enquiries", enquiries.length],
        ].map(([label, count]) => (
          <div key={label as string} className="rounded-xl bg-smoke px-3 py-3">
            <dd className="text-xl font-bold text-ink">{count}</dd>
            <dt className="text-xs text-ash">{label}</dt>
          </div>
        ))}
      </dl>

      <a
        href="/api/admin/backup"
        download
        className="mt-6 inline-flex rounded-full bg-signal px-8 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
      >
        Download backup
      </a>

      <ul className="mt-6 list-disc space-y-1.5 pl-5 text-xs text-ash">
        <li>The file contains customer names, phone numbers and emails. Keep it private.</li>
        <li>Product and banner images, and payment slips, are not inside this file.</li>
        <li>Admin logins are left out on purpose.</li>
        <li>Suggested: download one at the end of each month.</li>
      </ul>
    </div>
  );
}
