// Open/enabled state of the site assistant, shared by the panel and the buttons that open it.
import { createContext, useContext } from "react";

interface AssistantState {
  /** False until the server has an API key: then nothing assistant-related renders. */
  enabled: boolean;
  /** First name of the site owner, for labels. */
  name: string;
  openAssistant: () => void;
}

export const AssistantContext = createContext<AssistantState>({
  enabled: false,
  name: "",
  openAssistant: () => {},
});

export const useAssistant = () => useContext(AssistantContext);
