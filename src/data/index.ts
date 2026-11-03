// Data access layer. Each getter is async so it can be swapped for a
// Lovable Cloud query later without touching components.
import { queryOptions } from "@tanstack/react-query";
import { profile } from "./profile";
import { experience } from "./experience";
import { projects } from "./projects";
import { skills } from "./skills";

export * from "./types";

export const getProfile = async () => profile;
export const getExperience = async () => experience;
export const getProjects = async () => projects;
export const getSkills = async () => skills;

export const profileQuery = queryOptions({ queryKey: ["profile"], queryFn: getProfile });
export const experienceQuery = queryOptions({ queryKey: ["experience"], queryFn: getExperience });
export const projectsQuery = queryOptions({ queryKey: ["projects"], queryFn: getProjects });
export const skillsQuery = queryOptions({ queryKey: ["skills"], queryFn: getSkills });
