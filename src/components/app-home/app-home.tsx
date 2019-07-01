import { Component, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css"
})
export class AppHome {
  render() {
    return (
      <ion-content>
        <div class="backdrop">
          <control-provider>
            <what-a-drag />
          </control-provider>
        </div>
      </ion-content>
    );
  }
}
