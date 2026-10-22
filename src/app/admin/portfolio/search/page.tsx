import { verifyAdminSession } from "@/lib/server/dal";
import { listPortfolioProjects } from "@/lib/server/db";
import { deletePortfolioProjectAction, togglePortfolioEnabledAction } from "@/lib/server/actions";
import SearchShell from "@/components/admin/SearchShell";
import MobileProductCard from "@/components/admin/MobileProductCard";

export default async function PortfolioSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle
    ? (await listPortfolioProjects()).filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.client ?? "").toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle))
      )
    : [];

  return (
    <SearchShell
      placeholder="Project, client or tag"
      q={q}
      hint="You can search projects by title, client or tag"
      parent="/admin/portfolio"
      count={results.length}
    >
      <ul className="flex flex-col gap-3">
        {results.map((p) => (
          <MobileProductCard
            key={p.id}
            id={p.id}
            name={p.title}
            image={p.image}
            editHref={`/admin/portfolio/${p.id}/edit`}
            subtitle={[p.client, p.year].filter(Boolean).join(" · ") || undefined}
            tags={p.tags.length > 0 ? p.tags.join(", ") : undefined}
            enabled={p.isEnabled}
            toggleAction={togglePortfolioEnabledAction}
            deleteAction={deletePortfolioProjectAction}
            noun="project"
          />
        ))}
      </ul>
    </SearchShell>
  );
}
