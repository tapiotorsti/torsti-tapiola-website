// Loads the public site content for the assistant with the read-only public client.
import { publicClient } from "@/lib/supabase-public";
import { profile as fallbackProfile } from "@/data/profile";

import type { AssistantNotes } from "./notes";
import type { SiteContent } from "./prompt";

// The notes table is closed to visitors, so it is read with the service-role
// client, server-side only. The notes are optional: if they cannot be loaded,
// the assistant still answers from the public content.
async function loadAssistantNotes(): Promise<AssistantNotes | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("assistant_notes")
      .select("interests, favourites, work_style, learning, fun_facts, other")
      .eq("id", 1)
      .maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  const db = publicClient();
  const notes = loadAssistantNotes();
  const [profile, experience, courses, projects, skills] = await Promise.all([
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
      .from("courses")
      .select("title, provider, completed, credential_url, learned, skills")
      .order("sort_order"),
    db
      .from("projects")
      .select("title, summary, content, tech_stack, live_url, github_url")
      .order("sort_order"),
    db.from("skills").select("category, name").order("sort_order"),
  ]);

  const failed = [profile, experience, courses, projects, skills].find((r) => r.error);
  if (failed) throw new Error("Could not load site content");

  const p = profile.data;
  return {
    notes: await notes,
    profile: p
      ? { ...p, socials: (p.socials as SiteContent["profile"]["socials"] | null) ?? [] }
      : fallbackProfile,
    experience: experience.data ?? [],
    courses: courses.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
  };
}
