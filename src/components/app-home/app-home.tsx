import { Component, h, State } from "@stencil/core";

import { DotType } from "../what-a-drag/what-a-drag";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css"
})
export class AppHome {
  @State() dotType: DotType = "fader";

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Home</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <p>
          Welcome to the PWA Toolkit. You can use this starter to build entire
          apps with web components using Stencil and ionic/core! Check out the
          README for everything that comes in this starter out of the box and
          check out our docs on{" "}
          <a href="https://stenciljs.com">stenciljs.com</a> to get started.
        </p>

        <ion-button href="/profile/ionic" expand="block">
          Profile page
        </ion-button>
        <div>
          <h2>Choose your effect</h2>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="cruiser"
              checked={this.dotType === "fader"}
              onClick={() => (this.dotType = "fader")}
            />{" "}
            Fader
          </label>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="cruiser"
              checked={this.dotType === "cruiser"}
              onClick={() => (this.dotType = "cruiser")}
            />{" "}
            Cruiser
          </label>
          <label>
            <input
              type="radio"
              name="dot-type"
              value="gravity"
              checked={this.dotType === "gravity"}
              onClick={() => (this.dotType = "gravity")}
            />{" "}
            Gravity
          </label>
        </div>
        <what-a-drag type={this.dotType} />
      </ion-content>
    ];
  }
}
