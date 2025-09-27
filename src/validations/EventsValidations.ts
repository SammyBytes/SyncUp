import { ActionsSupported, EventsSupported } from "../common/EventsManager";

export const EvaluateEvent = (event: string): boolean => {
  return EventsSupported.includes(event);
};

export const EvaluateAction = (action: string): boolean => {
  return ActionsSupported.includes(action);
};
