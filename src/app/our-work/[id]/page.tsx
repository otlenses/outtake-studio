import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import ProjectDetail from "@/components/ProjectDetail";
import { getPortfolioProject } from "@/lib/server/db";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPortfolioProject(id);

  if (!item) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col bg-ink pt-[62px] text-white">
        <ProjectDetail item={item} />
      </main>
    </div>
  );
}
