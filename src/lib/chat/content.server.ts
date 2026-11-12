// Loads the public site content for the assistant with the read-only public client.
import { publicClient } from "@/lib/supabase-public";
import { profile as fallbackProfile } from "@/data/profile";

import type { SiteContent } from "./prompt";

export async function loadSiteContent(): Promise<SiteContent> {
  const db = publicClient();
  const [profile, experience, projects, skills] = await Promise.all([
    db
      .from("site_profile")
      .select("name, role, tagline, location, status, email, socials, years_experience")
      .eq("id", 1)
      .maybeSingle(),
    db
      .from("experience")
      .select("role, company, period, description, skills, kind")
      .order("sort_order"),
    db
      .from("projects")
      .select("title, summary, content, tech_stack, live_url, github_url")
      .order("sort_order"),
    db.from("skills").select("category, name").order("sort_order"),
  ]);

  const failed = [profile, experience, projects, skills].find((r) => r.error);
  if (failed) throw new Error("Could not load site content");

  const p = profile.data;
  return {
    profile: p
      ? { ...p, socials: (p.socials as SiteContent["profile"]["socials"] | null) ?? [] }
      : fallbackProfile,
    experience: experience.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
  };
}
