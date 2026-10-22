import { verifyAdminSession } from "@/lib/server/dal";
import { listMerchProducts } from "@/lib/server/db";
import { deleteMerchProductAction, toggleMerchEnabledAction } from "@/lib/server/actions";
import SearchShell from "@/components/admin/SearchShell";
import MobileProductCard from "@/components/admin/MobileProductCard";

export default async function MerchandiseSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle ? (await listMerchProducts()).filter((p) => p.name.toLowerCase().includes(needle)) : [];

  return (
    <SearchShell
      placeholder="Product name"
      q={q}
      hint="You can search merchandise by product name"
      parent="/admin/merchandise"
      count={results.length}
    >
      <ul className="flex flex-col gap-3">
        {results.map((p) => (
          <MobileProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            image={p.image}
            editHref={`/admin/merchandise/${p.id}/edit`}
            price={`RM ${p.price.toFixed(2)}`}
            enabled={p.isEnabled}
            toggleAction={toggleMerchEnabledAction}
            deleteAction={deleteMerchProductAction}
            noun="product"
          />
        ))}
      </ul>
    </SearchShell>
  );
}
