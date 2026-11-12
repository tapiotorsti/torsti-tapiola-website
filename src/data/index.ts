// Data access layer: profile, projects, experience, courses and skills come from Lovable Cloud.
import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { profile } from "./profile";
import {
  fetchCourses,
  fetchExperience,
  fetchProfile,
  fetchProjects,
  fetchSkills,
} from "./portfolio.functions";
import type { Profile, SkillGroup } from "./types";

export * from "./types";

export const getProfile = async (): Promise<Profile> => {
  const row = await fetchProfile();
  if (!row) return profile;
  return { ...row, socials: (row.socials as Profile["socials"]) ?? [] };
};
export const getExperience = () => fetchExperience();
export const getProjects = () => fetchProjects();
export const getSkills = async (): Promise<SkillGroup[]> => {
  const rows = await fetchSkills();
  const groups: SkillGroup[] = [];
  for (const r of rows) {
    let g = groups.find((x) => x.category === r.category);
    if (!g) groups.push((g = { category: r.category, items: [] }));
    g.items.push(r.name);
  }
  return groups;
};

export const profileQuery = queryOptions({ queryKey: ["profile"], queryFn: getProfile });

export type SiteIdentity = { name: string; role: string };

export async function loadSiteIdentity(queryClient: QueryClient): Promise<SiteIdentity> {
  try {
    const p = await queryClient.ensureQueryData(profileQuery);
    return { name: p.name || profile.name, role: p.role || profile.role };
  } catch {
    return { name: profile.name, role: profile.role };
  }
}

export function pageTitle(page: string, site: SiteIdentity | undefined) {
  const name = site?.name ?? profile.name;
  return page ? `${page} — ${name}` : `${name} — ${site?.role ?? profile.role}`;
}
export const experienceQuery = queryOptions({ queryKey: ["experience"], queryFn: getExperience });
export const coursesQuery = queryOptions({ queryKey: ["courses"], queryFn: () => fetchCourses() });
export const projectsQuery =queryOptions({ queryKey: ["projects"], queryFn: getProjects });
export const skillsQuery = queryOptions({ queryKey: ["skills"], queryFn: getSkills });
// Flat rows for the admin table; shares the "skills" key prefix so invalidation refreshes both.
export const skillRowsQuery = queryOptions({ queryKey: ["skills", "rows"], queryFn: () => fetchSkills() });

export const siteName = (site: SiteIdentity | undefined) => site?.name ?? profile.name;
