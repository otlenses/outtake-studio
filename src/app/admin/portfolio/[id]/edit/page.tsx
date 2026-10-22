import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { getPortfolioProject } from "@/lib/server/db";
import PortfolioForm from "../../PortfolioForm";

export default async function EditPortfolioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const project = await getPortfolioProject(id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/portfolio"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Edit portfolio project</h1>
      <PortfolioForm initial={project} />
    </div>
  );
}
