import { h } from "@stencil/core";
import { createProviderConsumer } from "@stencil/state-tunnel";

export type Effect = "fader" | "cruiser" | "gravity";

export enum Action {
  UPDATE_HUE = "UPDATE_HUE",
  UPDATE_EFFECT = "UPDATE_EFFECT"
}

export type ActionHandler =
  | { type: Action.UPDATE_EFFECT; effect: Effect }
  | { type: Action.UPDATE_HUE; hue: number };

export interface State {
  effect: Effect;
  hue: number;
  dispatch: (action: ActionHandler) => void;
}

export default createProviderConsumer<State>(
  {
    effect: "gravity",
    hue: 170,
    dispatch: () => {}
  },
  (subscribe, child) => (
    <context-consumer subscribe={subscribe} renderer={child} />
  )
);
