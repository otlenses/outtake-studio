import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listGearProducts, listPackageProducts } from "@/lib/server/db";
import {
  deleteGearProductAction,
  deletePackageProductAction,
  toggleGearEnabledAction,
  togglePackageEnabledAction,
} from "@/lib/server/actions";
import SegmentedControl from "@/components/admin/SegmentedControl";
import DeleteButton from "@/components/admin/DeleteButton";
import { MobileCardList } from "@/components/admin/MobileCards";
import MobileProductCard from "@/components/admin/MobileProductCard";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import ClickableRow from "@/components/admin/ClickableRow";
import StopClick from "@/components/admin/StopClick";
import ToggleSwitch from "@/components/admin/ToggleSwitch";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; state?: string; cat?: string; brand?: string }>;
}) {
  await verifyAdminSession();
  const { type = "gear", q = "", state: rawState = "all", cat = "", brand = "" } = await searchParams;
  const state = rawState === "active" || rawState === "inactive" ? rawState : "all";
  const byState = (x: { isEnabled: boolean }) =>
    state === "active" ? x.isEnabled : state === "inactive" ? !x.isEnabled : true;
  const needle = q.trim().toLowerCase();

  const [allGearProducts, allPackageProducts] = await Promise.all([
    listGearProducts(),
    listPackageProducts(),
  ]);

  const gearSearched = needle
    ? allGearProducts.filter(
        (g) => g.name.toLowerCase().includes(needle) || g.brand.toLowerCase().includes(needle)
      )
    : allGearProducts;
  const gearScoped = gearSearched.filter((g) => (!cat || g.category === cat) && (!brand || g.brand === brand));
  const gearProducts = gearScoped.filter(byState);
  const packageSearched = needle
    ? allPackageProducts.filter((p) => p.name.toLowerCase().includes(needle))
    : allPackageProducts;
  const packageProducts = packageSearched.filter(byState);

  const scoped = type === "packages" ? packageSearched : gearScoped;
  const counts = {
    all: scoped.length,
    active: scoped.filter((x) => x.isEnabled).length,
    inactive: scoped.filter((x) => !x.isEnabled).length,
  };
  const categories = Array.from(new Set(allGearProducts.map((g) => g.category))).sort();
  const brands = Array.from(new Set(allGearProducts.map((g) => g.brand).filter(Boolean))).sort();
  const options = [
    { value: "gear", label: "Rental gear", count: allGearProducts.length },
    { value: "packages", label: "Packages", count: allPackageProducts.length },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Products & packages</h1>
        <Link
          href={type === "packages" ? "/admin/products/packages/new" : "/admin/products/gear/new"}
          className="whitespace-nowrap rounded-full bg-signal px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] md:px-5"
        >
          <span className="md:hidden">+ Add</span>
          <span className="hidden md:inline">{type === "packages" ? "+ Add package" : "+ Add rental product"}</span>
        </Link>
      </div>

      <div className="mb-4 md:mb-6">
        <SegmentedControl options={options} paramName="type" />
      </div>

      <div className="mb-4 md:hidden">
        <MobileSearchBar
          searchHref="/admin/products/search"
          placeholder="Search by name or brand"
          q={q}
          keep={{
            type,
            state: state === "all" ? "" : state,
            cat: type === "packages" ? "" : cat,
            brand: type === "packages" ? "" : brand,
          }}
          filter={
            type === "packages" ? { state, counts } : { state, counts, categories, category: cat, brands, brand }
          }
        />
      </div>

      <DesktopSearch
        placeholder="Search by name or brand"
        q={q}
        hidden={{ type }}
        clearHref={`/admin/products?type=${type}`}
      />

      {type === "packages" ? (
        <PackagesTable packageProducts={packageProducts} />
      ) : (
        <GearTable gearProducts={gearProducts} />
      )}
    </div>
  );
}

function GearTable({ gearProducts }: { gearProducts: Awaited<ReturnType<typeof listGearProducts>> }) {
  if (gearProducts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
        <p className="font-mono text-xs text-ash">No rental products found.</p>
      </div>
    );
  }

  return (
    <div>
      <MobileCardList>
        {gearProducts.map((g) => (
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
      </MobileCardList>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Daily rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {gearProducts.map((g) => (
              <ClickableRow key={g.id} href={`/admin/products/gear/${g.id}/edit`} off={!g.isEnabled}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-smoke">
                      <Image src={g.image} alt={g.name} fill className="object-cover" />
                    </div>
                    <span className="font-mono text-xs font-semibold">{g.name}</span>
                    {g.isNew && (
                      <span className="rounded-full bg-signal/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-ink">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ash">{g.category}</td>
                <td className="px-4 py-3 font-mono text-xs text-ash">{g.brand}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold">RM {g.dailyRate.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <ToggleSwitch id={g.id} initialEnabled={g.isEnabled} action={toggleGearEnabledAction} />
                </td>
                <td className="px-4 py-3">
                  <StopClick>
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/gear/${g.id}/edit`}
                        className="font-mono text-[11px] text-ink underline underline-offset-2 hover:text-signal"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteGearProductAction}
                        id={g.id}
                        confirmMessage={`Delete "${g.name}"? This can't be undone.`}
                      />
                    </div>
                  </StopClick>
                </td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackagesTable({ packageProducts }: { packageProducts: Awaited<ReturnType<typeof listPackageProducts>> }) {
  if (packageProducts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
        <p className="font-mono text-xs text-ash">No packages found.</p>
      </div>
    );
  }

  return (
    <div>
      <MobileCardList>
        {packageProducts.map((p) => (
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
      </MobileCardList>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Home page</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {packageProducts.map((p) => (
              <ClickableRow key={p.id} href={`/admin/products/packages/${p.id}/edit`} off={!p.isEnabled}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-smoke">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-semibold">{p.name}</div>
                      <div className="font-mono text-[11px] text-ash">{p.tagline}</div>
                    </div>
                    {p.featured && (
                      <span className="rounded-full bg-signal/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-ink">
                        Popular
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold">
                  {p.price} {p.period}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ash">{p.featuredOnHome ? "Shown" : "—"}</td>
                <td className="px-4 py-3">
                  <ToggleSwitch id={p.id} initialEnabled={p.isEnabled} action={togglePackageEnabledAction} />
                </td>
                <td className="px-4 py-3">
                  <StopClick>
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/packages/${p.id}/edit`}
                        className="font-mono text-[11px] text-ink underline underline-offset-2 hover:text-signal"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deletePackageProductAction}
                        id={p.id}
                        confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                      />
                    </div>
                  </StopClick>
                </td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
