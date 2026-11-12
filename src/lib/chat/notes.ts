// Sections of the assistant notes: background the assistant may use that is not
// shown on the site. Shared by the admin form and the prompt builder.
export const ASSISTANT_NOTE_FIELDS = [
  {
    key: "interests",
    label: "Hobbies & interests",
    hint: "What you do outside work, sports, side projects.",
  },
  {
    key: "favourites",
    label: "Favourites",
    hint: "Books, music, films, food, tools, programming languages …",
  },
  {
    key: "work_style",
    label: "Working style & values",
    hint: "How you like to work, what matters to you in a team.",
  },
  {
    key: "learning",
    label: "Currently learning & goals",
    hint: "What you are studying now and where you want to grow.",
  },
  {
    key: "fun_facts",
    label: "Fun facts",
    hint: "Small things that make good conversation starters.",
  },
  {
    key: "other",
    label: "Anything else",
    hint: "Other background the assistant may use.",
  },
] as const;

export type AssistantNoteKey = (typeof ASSISTANT_NOTE_FIELDS)[number]["key"];
export type AssistantNotes = Record<AssistantNoteKey, string>;

// Matches the CHECK constraints in 0011_assistant_notes.sql.
export const NOTE_MAX_CHARS = 2000;
