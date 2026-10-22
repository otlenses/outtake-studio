import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listMerchProducts } from "@/lib/server/db";
import { deleteMerchProductAction, toggleMerchEnabledAction } from "@/lib/server/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import { MobileCardList } from "@/components/admin/MobileCards";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import MobileProductCard from "@/components/admin/MobileProductCard";
import ClickableRow from "@/components/admin/ClickableRow";
import StopClick from "@/components/admin/StopClick";
import ToggleSwitch from "@/components/admin/ToggleSwitch";

export default async function AdminMerchandisePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  await verifyAdminSession();
  const { q = "", state: rawState = "all" } = await searchParams;
  const state = rawState === "active" || rawState === "inactive" ? rawState : "all";
  const allProducts = await listMerchProducts();
  const needle = q.trim().toLowerCase();
  const searched = needle ? allProducts.filter((p) => p.name.toLowerCase().includes(needle)) : allProducts;
  const products = searched.filter((p) =>
    state === "active" ? p.isEnabled : state === "inactive" ? !p.isEnabled : true
  );
  const counts = {
    all: searched.length,
    active: searched.filter((p) => p.isEnabled).length,
    inactive: searched.filter((p) => !p.isEnabled).length,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Merchandise</h1>
        <Link
          href="/admin/merchandise/new"
          className="whitespace-nowrap rounded-full bg-signal px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] md:px-5"
        >
          <span className="md:hidden">+ Add</span>
          <span className="hidden md:inline">+ Add product</span>
        </Link>
      </div>

      <div className="mb-4 md:hidden">
        <MobileSearchBar searchHref="/admin/merchandise/search" placeholder="Search merchandise" q={q} keep={{ state: state === "all" ? "" : state }} filter={{ state, counts }} />
      </div>

      <DesktopSearch
        placeholder="Search merchandise"
        q={q}
        hidden={{ state: state === "all" ? "" : state }}
        clearHref={state === "all" ? "/admin/merchandise" : `/admin/merchandise?state=${state}`}
      />

      {products.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="font-mono text-xs text-ash">No merchandise products found.</p>
        </div>
      ) : (
                <div>
<MobileCardList>
          {products.map((p) => (
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
        </MobileCardList>

        <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <ClickableRow key={p.id} href={`/admin/merchandise/${p.id}/edit`} off={!p.isEnabled}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-smoke">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <span className="font-mono text-xs font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">RM {p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <ToggleSwitch id={p.id} initialEnabled={p.isEnabled} action={toggleMerchEnabledAction} />
                  </td>
                  <td className="px-4 py-3">
                    <StopClick>
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/merchandise/${p.id}/edit`}
                          className="font-mono text-[11px] text-ink underline underline-offset-2 hover:text-signal"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteMerchProductAction}
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
      )}
    </div>
  );
}
