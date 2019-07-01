import { Component, h, Prop } from "@stencil/core";

import Tunnel, {
  Effect,
  Action,
  ActionHandler
} from "../control-provider/data/control";

@Component({
  tag: "drag-controls",
  styleUrl: "style.css",
  scoped: true
})
export class WhatADrag {
  @Prop() dispatch: (action: ActionHandler) => void;
  @Prop() effect: Effect;
  @Prop() hue: number;

  setHue = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
    this.dispatch({ type: Action.UPDATE_HUE, hue: parseInt(value, 10) });
  };

  setEffect = (effect: Effect) => () => {
    this.dispatch({ type: Action.UPDATE_EFFECT, effect });
  };

  render() {
    return (
      <div
        class="controls"
        onMouseMove={e => e.stopPropagation()}
        ref={node =>
          node.addEventListener("touchmove", e => e.stopPropagation())
        }
      >
        <div class="control">
          <h2>Draw on me!</h2>
          <p>
            Try click-dragging to draw on the screen. If you have a touch
            screen, try drawing with your finger!
          </p>
        </div>
        <div class="control">
          <h2>Choose your effect</h2>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="cruiser"
              checked={this.effect === "fader"}
              onClick={this.setEffect("fader")}
            />{" "}
            Fader
          </label>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="cruiser"
              checked={this.effect === "cruiser"}
              onClick={this.setEffect("cruiser")}
            />{" "}
            Cruiser
          </label>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="gravity"
              checked={this.effect === "gravity"}
              onClick={this.setEffect("gravity")}
            />{" "}
            Gravity
          </label>
        </div>
        <div class="control">
          <h2>Choose a color</h2>
          <input
            type="range"
            class="color-slider"
            min={0}
            max={360}
            value={this.hue}
            onInput={this.setHue}
          />
          <div
            class="base-color"
            style={{ "background-color": `hsla(${this.hue}, 100%, 50%, 1)` }}
          />
        </div>
      </div>
    );
  }
}

Tunnel.injectProps(WhatADrag, ["effect", "hue", "dispatch"]);
