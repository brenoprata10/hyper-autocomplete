import { keys } from "../utils";

import {
  Actions,
  ActionTypes,
  addCharAction,
  commandSplitAction,
  deleteLineAction,
  deleteWordAction,
  HyperActionTypes,
  removeCharAction,
  resetInputAction,
  stopInputAction,
  updateCommandAction
} from "./actions";
import { setCwd, updateSuggestions } from "./effects";
import { deleteCharAt, deleteWordAt } from "../common/string";
import {
  Autocomplete,
  AutocompleteContext,
  AutocompleteSessionsState,
  AutocompleteState
} from "../models/autocomplete.types";

/** INIT STATE */

export const initState: Autocomplete = {
  sessions: {}
};

const initSession: AutocompleteContext = {
  splitPosition: 0,
  column: 0,
  currentLine: "",
  currentUserInput: "",
  inputLine: null,
  scrollPosition: 0,
  cursorPosition: null,
  stopped: false,
  cwd: "",
  argumentList: [],
  suggestions: []
};

/**
 * SELECTORS
 */

export const getAutocomplete = (state: AutocompleteSessionsState) =>
  state.autocomplete || initState;
export const getSessions = (state: AutocompleteSessionsState) =>
  getAutocomplete(state).sessions;

export const getSessionByUid = (
  state: AutocompleteSessionsState,
  uid: string
) => getSessions(state)[uid] || initSession;

/** REDUCERS */

export const reduceSessions = (
  state: HyperSessions & AutocompleteSessionsState & any,
  action: Actions
): HyperSessions & AutocompleteSessionsState => {
  console.log({ state, action });
  switch (action.type) {
    case ActionTypes.SetCwd:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        cwd: action.payload.cwd
      });
    case ActionTypes.ResetInput:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: "",
        stopped: false
      });

    case ActionTypes.DeleteWord: {
      const session = getSessionByUid(state, action.payload.uid);
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...session,
        currentUserInput: deleteWordAt(
          session.currentUserInput,
          session.column
        ),
        stopped: false
      });
    }
    case ActionTypes.DeleteLine: {
      const session = getSessionByUid(state, action.payload.uid);
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...session,
        currentUserInput: session.currentUserInput.slice(session.splitPosition),
        stopped: false
      });
    }
    case ActionTypes.StopInput:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: "",
        stopped: true
      });

    case ActionTypes.CommandSplit: {
      const { currentUserInput, ...currentState } = getSessionByUid(
        state,
        action.payload.uid
      );
      const newUserInput =
        (currentUserInput.endsWith("\\") &&
          currentUserInput.substr(0, currentUserInput.length - 1)) ||
        currentUserInput;
      const splitPosition = newUserInput.length;
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...currentState,
        splitPosition,
        currentUserInput: newUserInput
      });
    }
    case ActionTypes.UiChange: {
      const currentState = getSessionByUid(state, action.payload.uid);

      const { payload } = action;
      const merged: AutocompleteContext = {
        ...currentState,
        inputLine: payload.inputLine ?? currentState.inputLine,
        cursorPosition: payload.cursorPosition ?? currentState.cursorPosition,
        currentLine: payload.currentLine ?? currentState.currentLine,
        scrollPosition: payload.scrollPosition ?? currentState.scrollPosition
      };
      return state.setIn(
        ["autocomplete", "sessions", action.payload.uid],
        merged
      );
    }
    case ActionTypes.SetSuggestions:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        suggestions: action.payload.suggestions
      });
    case ActionTypes.AddChar: {
      const session = getSessionByUid(state, action.payload.uid);
      const currentUserInput =
        session.currentUserInput.slice(0, session.column) +
        action.payload.event.key +
        session.currentUserInput.slice(session.column);
      return session.stopped
        ? state
        : state.setIn(["autocomplete", "sessions", action.payload.uid], {
            ...session,
            currentUserInput,
            column: session.column + action.payload.event.key.length
          });
    }
    case ActionTypes.RemoveChar: {
      const session = getSessionByUid(state, action.payload.uid);
      return session.stopped
        ? state
        : state.setIn(["autocomplete", "sessions", action.payload.uid], {
            ...session,
            currentUserInput: deleteCharAt(
              session.currentUserInput,
              session.column
            )
          });
    }
    case ActionTypes.SetAutocompleteSuggestion: {
      const session = getSessionByUid(state, action.payload.uid);
      console.log({ state });
      const ste = state.setIn([action.payload.uid], {
        ...session,
        currentUserInput: action.payload.suggestion.label,
        currentLine: action.payload.suggestion.label,
        command: action.payload.suggestion.label,
        column: session.column
      });
      console.log({ newState: ste });
      return ste;
    }
    case ActionTypes.UpdateCommand: {
      const session = getSessionByUid(state, action.payload.uid);
      const fullCommand = session.currentUserInput.split(" ");
      const argumentList = fullCommand.slice(1);
      const command = fullCommand[0];
      const merged = {
        ...session,
        argument: undefined as any,
        argumentList,
        command
      };

      if (!session.currentLine || !session.cursorPosition) {
        return state.setIn(
          ["autocomplete", "sessions", action.payload.uid],
          merged
        );
      }
      const currentUserInputLine = session.currentUserInput.substr(
        session.splitPosition
      );
      const lineStartIndex = session.currentLine.indexOf(currentUserInputLine);
      console.log(lineStartIndex);
      if (!lineStartIndex) {
        // Something messed up, our currentUserInput is not equal to the current line
        return state.setIn(
          ["autocomplete", "sessions", action.payload.uid],
          merged
        );
      }
      const currentPrompt = session.currentLine.substr(0, lineStartIndex);
      const currentUserInputColumn =
        session.cursorPosition.col -
        currentPrompt.length +
        session.splitPosition;
      console.log(
        session.cursorPosition.col,
        currentPrompt,
        currentUserInputColumn
      );
      const fullCommandRunningTotal = fullCommand.reduce<number[]>(
        (prev, curr, i) => [
          ...prev,
          curr.length + (prev[i - 1] || 0) + (i > 0 ? 1 : 0)
        ],
        []
      );
      const fullCommandCurrentIndex = fullCommandRunningTotal.findIndex(
        total => total >= currentUserInputColumn
      );
      const argument =
        fullCommandCurrentIndex > 0
          ? fullCommand[fullCommandCurrentIndex]
          : undefined;

      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...merged,
        column: currentUserInputColumn,
        argument
      });
    }
    case HyperActionTypes.Init:
      return state.set("autocomplete", initState);
    default:
      return state;
  }
};

export const middleware = (store: any) => (
  next: (action: Action<any>) => void
) => (action: Actions) => {
  next(action);
  const state: HyperState & AutocompleteState = store.getState();
  const activeUid = state.sessions.activeUid;
  const { data } = action as any;
  console.log({ data, action });
  switch (action.type) {
    case ActionTypes.SetAutocompleteSuggestion: {
      store.dispatch({ type: "TESTING" });
    }
    case HyperActionTypes.SessionUserData: {
      const event = window.event as KeyboardEvent | undefined;
      console.log(event);
      if (!event) {
        break;
      }
      const { keyCode, charCode, ctrlKey } = event;
      switch (keyCode) {
        case keys.c:
          if (ctrlKey) {
            store.dispatch(resetInputAction(activeUid));
          }
          break;
        case keys.enter:
          const autocompleteSession =
            state.sessions.autocomplete.sessions[activeUid];
          if (!autocompleteSession) break;
          if (!autocompleteSession.currentUserInput.endsWith("\\")) {
            store.dispatch(resetInputAction(activeUid));
          } else {
            store.dispatch(commandSplitAction(activeUid));
          }
          break;
        case keys.arrowUp:
        case keys.arrowDown:
          store.dispatch(stopInputAction(activeUid));
          break;
        case keys.backspace:
          store.dispatch(removeCharAction(activeUid));
          break;
        case keys.arrowLeft:
        case keys.arrowRight:
          break;
        default:
          if (keyCode || charCode)
            store.dispatch(
              addCharAction(
                activeUid,
                event,
                String.fromCharCode(keyCode || charCode)
              )
            );
      }
      break;
    }
  }
  console.log({ middlewareState: state });
  switch (action.type) {
    /**
     * Cwd Actions
     */
    case HyperActionTypes.SetXTermTitle:
    case HyperActionTypes.SessionSetActive:
      const pid = state.sessions.sessions[action.uid].pid;
      setCwd(store.dispatch, action.uid, pid);
      break;
    case HyperActionTypes.SessionAdd:
      setCwd(store.dispatch, activeUid, action.pid);
      break;
    case HyperActionTypes.SessionAddData:
      const event = window.event as KeyboardEvent | undefined;
      if (event && event.keyCode === keys.enter) {
        const sessions = store.getState().sessions;
        const pid = sessions.sessions[sessions.activeUid].pid;
        setCwd(store.dispatch, activeUid, pid);
      }
      break;
    case HyperActionTypes.UiCommandExec:
      switch (action.command) {
        case "editor:break":
          store.dispatch(resetInputAction(activeUid));
          break;
        case "editor:deleteBeginningLine":
          store.dispatch(deleteLineAction(activeUid));
          break;
        case "editor:deletePreviousWord":
          store.dispatch(deleteWordAction(activeUid));
          break;
        default:
          console.warn(`Unhandled UICommandExec: ${action.command}`);
      }
      break;

    /**
     * Update Autocomplete Suggestions
     */
    case ActionTypes.ResetInput:
    case ActionTypes.StopInput:
    case ActionTypes.SetCwd:
    case ActionTypes.UiChange:
    case ActionTypes.CommandSplit:
      store.dispatch(updateCommandAction(action.payload.uid));
      break;

    case ActionTypes.UpdateCommand:
      updateSuggestions(
        store.dispatch,
        action.payload.uid,
        getSessionByUid(state.sessions, action.payload.uid)
      );
      store.dispatch({ type: "TESTING" });
      break;
  }
};
