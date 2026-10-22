import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listPortfolioProjects } from "@/lib/server/db";
import { deletePortfolioProjectAction, movePortfolioProjectAction, togglePortfolioEnabledAction } from "@/lib/server/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import { MobileCardList } from "@/components/admin/MobileCards";
import MobileProductCard from "@/components/admin/MobileProductCard";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import ClickableRow from "@/components/admin/ClickableRow";
import StopClick from "@/components/admin/StopClick";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import MoveButtons from "./MoveButtons";

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  await verifyAdminSession();
  const { q = "", state: rawState = "all" } = await searchParams;
  const state = rawState === "active" || rawState === "inactive" ? rawState : "all";
  const needle = q.trim().toLowerCase();
  const allProjects = await listPortfolioProjects();
  const searched = needle
    ? allProjects.filter(
        (p) => p.title.toLowerCase().includes(needle) || (p.client ?? "").toLowerCase().includes(needle)
      )
    : allProjects;
  const projects = searched.filter((p) =>
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
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Portfolio</h1>
        <Link
          href="/admin/portfolio/new"
          className="whitespace-nowrap rounded-full bg-signal px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] md:px-5"
        >
          <span className="md:hidden">+ Add</span>
          <span className="hidden md:inline">+ Add project</span>
        </Link>
      </div>

      <div className="mb-4 md:hidden">
        <MobileSearchBar searchHref="/admin/portfolio/search" placeholder="Search by project or client" q={q} keep={{ state: state === "all" ? "" : state }} filter={{ state, counts }} />
      </div>

      <DesktopSearch
        placeholder="Search by project or client name"
        q={q}
        hidden={{ state: state === "all" ? "" : state }}
        clearHref={state === "all" ? "/admin/portfolio" : `/admin/portfolio?state=${state}`}
      />

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="font-mono text-xs text-ash">No portfolio projects found.</p>
        </div>
      ) : (
                <div>
<MobileCardList>
          {projects.map((project, i) => (
            <MobileProductCard
              key={project.id}
              id={project.id}
              name={project.title}
              image={project.image}
              editHref={`/admin/portfolio/${project.id}/edit`}
              subtitle={[project.client, project.year].filter(Boolean).join(" · ") || undefined}
              tags={project.tags.length > 0 ? project.tags.join(", ") : undefined}
              enabled={project.isEnabled}
              toggleAction={togglePortfolioEnabledAction}
              deleteAction={deletePortfolioProjectAction}
              noun="project"
              move={{ action: movePortfolioProjectAction, canUp: i !== 0, canDown: i !== projects.length - 1 }}
            />
          ))}
        </MobileCardList>

        <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <ClickableRow key={project.id} href={`/admin/portfolio/${project.id}/edit`} off={!project.isEnabled}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-smoke">
                        <Image src={project.image} alt={project.title} fill className="object-cover" />
                      </div>
                      <span className="font-mono text-xs font-semibold">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ash">{project.tags.join(", ")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">{project.client || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">{project.year || "—"}</td>
                  <td className="px-4 py-3">
                    <StopClick>
                      <MoveButtons id={project.id} disableUp={i === 0} disableDown={i === projects.length - 1} />
                    </StopClick>
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      id={project.id}
                      initialEnabled={project.isEnabled}
                      action={togglePortfolioEnabledAction}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StopClick>
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/portfolio/${project.id}/edit`}
                          className="font-mono text-[11px] text-ink underline underline-offset-2 hover:text-signal"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          action={deletePortfolioProjectAction}
                          id={project.id}
                          confirmMessage={`Delete "${project.title}"? This can't be undone.`}
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
