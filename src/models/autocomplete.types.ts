import { CursorPosition } from "./cursor-position.types";

export interface Suggestion {
  label: string;
  kind?: "Function" | "File" | "Directory" | "Executable" | "Snippet";
  detail?: string;
  documentation?: string;
  sortText?: string;
  filterText?: string;
  insertText?: string | { value: string };
  highlightLabel?: React.ReactNode;
}

export interface AutocompleteContext {
  column: number;
  splitPosition: number;
  scrollPosition: number;
  inputLine: number | null;
  currentLine: string | null;
  cursorPosition: CursorPosition | null;
  currentUserInput: string;
  stopped: boolean;
  suggestions: Suggestion[];
  cwd: string;
  command?: string;
  argument?: string;
  argumentList: string[];
}

export interface Autocomplete {
  sessions: {
    [key: string]: AutocompleteContext | undefined;
  };
}

export interface AutocompleteSessionsState {
  autocomplete: Autocomplete;
}

export interface AutocompleteState {
  sessions: AutocompleteSessionsState;
}

export type AutocompleteProvider = (
  context: AutocompleteContext
) => Promise<Suggestion[]>;

export interface SubcommandConfig {
  name: string;
  detail?: string;
  provider?: AutocompleteProvider;
}
