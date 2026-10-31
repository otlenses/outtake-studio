import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listMotionControlProducts } from "@/lib/server/db";
import {
  deleteMotionControlProductAction,
  moveMotionControlProductAction,
  toggleMotionControlEnabledAction,
} from "@/lib/server/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import { MobileCardList } from "@/components/admin/MobileCards";
import MobileProductCard from "@/components/admin/MobileProductCard";
import ClickableRow from "@/components/admin/ClickableRow";
import StopClick from "@/components/admin/StopClick";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import MoveButtons from "./MoveButtons";

export default async function AdminMotionControlPage() {
  await verifyAdminSession();
  const products = await listMotionControlProducts();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Motion control</h1>
        <Link
          href="/admin/motion-control/new"
          className="whitespace-nowrap rounded-full bg-signal px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] md:px-5"
        >
          <span className="md:hidden">+ Add</span>
          <span className="hidden md:inline">+ Add product</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="font-mono text-xs text-ash">No motion control products yet.</p>
        </div>
      ) : (
        <div>
          <MobileCardList>
            {products.map((product, i) => (
              <MobileProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                editHref={`/admin/motion-control/${product.id}/edit`}
                subtitle={product.rateCardUrl ? "Rate card PDF uploaded" : "No rate card PDF yet"}
                enabled={product.isEnabled}
                toggleAction={toggleMotionControlEnabledAction}
                deleteAction={deleteMotionControlProductAction}
                noun="product"
                move={{ action: moveMotionControlProductAction, canUp: i !== 0, canDown: i !== products.length - 1 }}
              />
            ))}
          </MobileCardList>

          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Rate card</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <ClickableRow key={product.id} href={`/admin/motion-control/${product.id}/edit`} off={!product.isEnabled}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-smoke">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <span className="font-mono text-xs font-semibold">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ash">
                      {product.rateCardUrl ? (
                        <StopClick>
                          <a
                            href={product.rateCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ink underline underline-offset-2 hover:text-signal"
                          >
                            View PDF
                          </a>
                        </StopClick>
                      ) : (
                        "No PDF yet"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StopClick>
                        <MoveButtons id={product.id} disableUp={i === 0} disableDown={i === products.length - 1} />
                      </StopClick>
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        id={product.id}
                        initialEnabled={product.isEnabled}
                        action={toggleMotionControlEnabledAction}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StopClick>
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/motion-control/${product.id}/edit`}
                            className="font-mono text-[11px] text-ink underline underline-offset-2 hover:text-signal"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            action={deleteMotionControlProductAction}
                            id={product.id}
                            confirmMessage={`Delete "${product.name}"? This can't be undone.`}
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
