import { createServerFn } from "@tanstack/react-start";
import { publicClient } from "@/lib/supabase-public";

export const fetchProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("projects")
    .select(
      "id, title, slug, summary, content, tech_stack, live_url, github_url, featured, sort_order",
    )
    .order("sort_order");
  if (error) throw new Error("Could not load projects");
  return data;
});

export const fetchExperience = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("experience")
    .select("id, role, company, period, description, skills, sort_order, kind")
    .order("sort_order");
  if (error) throw new Error("Could not load experience");
  return data;
});

export const fetchCourses = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("courses")
    .select("id, title, provider, completed, credential_url, learned, skills, sort_order")
    .order("sort_order");
  if (error) throw new Error("Could not load courses");
  return data;
});

export const fetchSkills = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("skills")
    .select("id, category, name, sort_order")
    .order("sort_order");
  if (error) throw new Error("Could not load skills");
  return data;
});

export const fetchProfile = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("site_profile")
    .select("name, role, tagline, location, status, email, socials, years_experience")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error("Could not load profile");
  return data;
});
