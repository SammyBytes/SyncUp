import { EventsSupported } from "../common/EventsManager";

export const EvaluateEvent = (event: string): boolean => {
  return EventsSupported.includes(event);
};
