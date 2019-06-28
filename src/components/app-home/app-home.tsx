import { Component, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css"
})
export class AppHome {
  render() {
    return (
      <div class="backdrop">
        <what-a-drag />
      </div>
    );
  }
}
