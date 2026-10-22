import { verifyAdminSession } from "@/lib/server/dal";
import { listGearProducts, listPackageProducts } from "@/lib/server/db";
import {
  deleteGearProductAction,
  deletePackageProductAction,
  toggleGearEnabledAction,
  togglePackageEnabledAction,
} from "@/lib/server/actions";
import SearchShell from "@/components/admin/SearchShell";
import MobileProductCard from "@/components/admin/MobileProductCard";

export default async function ProductSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const [gear, packages] = needle
    ? await Promise.all([listGearProducts(), listPackageProducts()])
    : [[], []];
  const gearResults = gear.filter(
    (g) =>
      g.name.toLowerCase().includes(needle) ||
      g.brand.toLowerCase().includes(needle) ||
      g.category.toLowerCase().includes(needle)
  );
  const packageResults = packages.filter(
    (p) => p.name.toLowerCase().includes(needle) || p.tagline.toLowerCase().includes(needle)
  );

  return (
    <SearchShell
      placeholder="Name, brand or category"
      q={q}
      hint="You can search rental gear and packages by name, brand or category"
      parent="/admin/products"
      count={gearResults.length + packageResults.length}
    >
      {gearResults.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold text-ink">Rental gear ({gearResults.length})</h2>
          <ul className="flex flex-col gap-3">
            {gearResults.map((g) => (
              <MobileProductCard
                key={g.id}
                id={g.id}
                name={g.name}
                image={g.image}
                editHref={`/admin/products/gear/${g.id}/edit`}
                subtitle={`${g.brand} · ${g.category}`}
                price={`RM ${g.dailyRate.toFixed(2)}`}
                priceSuffix="/day"
                badge={g.isNew ? "New" : undefined}
                enabled={g.isEnabled}
                toggleAction={toggleGearEnabledAction}
                deleteAction={deleteGearProductAction}
                noun="product"
              />
            ))}
          </ul>
        </section>
      )}
      {packageResults.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Packages ({packageResults.length})</h2>
          <ul className="flex flex-col gap-3">
            {packageResults.map((p) => (
              <MobileProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                image={p.image}
                editHref={`/admin/products/packages/${p.id}/edit`}
                subtitle={p.tagline}
                price={p.price}
                priceSuffix={p.period}
                badge={p.featured ? "Popular" : undefined}
                enabled={p.isEnabled}
                toggleAction={togglePackageEnabledAction}
                deleteAction={deletePackageProductAction}
                noun="package"
              />
            ))}
          </ul>
        </section>
      )}
    </SearchShell>
  );
}
