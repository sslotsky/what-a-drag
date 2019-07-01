import { Component, h, State } from "@stencil/core";

import Tunnel, { Effect, Action, ActionHandler } from "./data/control";

@Component({
  tag: "control-provider"
})
export class MyApp {
  @State() effect: Effect = "gravity";
  @State() hue: number = 170;

  dispatch = (action: ActionHandler) => {
    switch (action.type) {
      case Action.UPDATE_HUE:
        this.hue = action.hue;
        break;
      case Action.UPDATE_EFFECT:
        this.effect = action.effect;
        break;
      default:
        break;
    }
  };

  render() {
    const tunnelState = {
      effect: this.effect,
      hue: this.hue,
      dispatch: this.dispatch
    };

    return (
      <Tunnel.Provider state={tunnelState}>
        <slot />
      </Tunnel.Provider>
    );
  }
}
