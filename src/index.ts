import { AutocompleteState } from "./models/autocomplete.types";

export { decorateTerm } from "./ui";
export { middleware, reduceSessions } from "./store/reducer";

import { getAutocomplete, getSessionByUid } from "./store/reducer";

import "../assets/index.scss";

export const mapTermsState = (
  state: HyperState & AutocompleteState,
  map: any
) => {
  return { ...map, autocomplete: getAutocomplete(state.sessions) };
};

export const getTermGroupProps = (
  _uid: string,
  parentProps: any,
  props: any
) => {
  return { ...props, autocomplete: parentProps.autocomplete };
};

export const getTermProps = (uid: string, parentProps: any, props: any) => {
  return { ...props, context: getSessionByUid(parentProps, uid), parentProps };
};

// This reducer will trigger calls to the parent react store, we will need to add middleware detecting events and triggering data according to it
exports.reduceUI = (state: any, action: any) => {
  switch (action.type) {
    case "TESTING":
      console.log("testing stuff!!!");
      // Toggle wow mode!
      return state.set("testing", "testingaction");
  }
  return state;
};
