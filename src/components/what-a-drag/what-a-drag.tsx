import { Component, h, State, Prop, Watch } from "@stencil/core";

import Tunnel, {
  Effect,
  ActionHandler
} from "../control-provider/data/control";

import { Dot, fader, cruiser, gravity } from "./effects";

interface Inker {
  ink: (x: number, y: number) => void;
  notify: (x: number, y: number) => void;
  stop: () => void;
}

export type DotType = "fader" | "cruiser" | "gravity";

const dotMaker = { fader, cruiser, gravity };

function start(canvas: HTMLCanvasElement, type: DotType, hue: number) {
  const dots: Dot[] = [];

  function ink(x: number, y: number) {
    const factory = dotMaker[type] || fader;
    dots.push(factory(x, y));
  }

  function notify(x: number, y: number) {
    for (let dot of dots) {
      dot.notify(x, y);
    }
  }

  const context = canvas.getContext("2d");

  let requestId = 0;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = dots.length; i > 0; i--) {
      const dot = dots[i - 1];

      if (dot.done()) {
        dots.splice(i - 1, 1);
        continue;
      }

      const { saturation, light, alpha } = dot.style();
      context.fillStyle = `hsla(${hue}, ${saturation}%, ${light}%, ${alpha})`;
      const position = dot.position();
      context.fillRect(position.x, position.y, 5, 5);

      dot.tick();
    }

    requestId = requestAnimationFrame(draw);
  }

  draw();

  return { ink, notify, stop: () => cancelAnimationFrame(requestId) };
}

@Component({
  tag: "what-a-drag",
  styleUrl: "style.css",
  shadow: true
})
export class WhatADrag {
  canvas?: HTMLCanvasElement;
  wrapper?: HTMLDivElement;
  inker?: Inker;
  @State() height: number = window.innerHeight;
  @State() width: number = window.innerWidth;
  @Prop() dispatch: (action: ActionHandler) => void;
  @Prop() effect: Effect;
  @Prop() hue: number;

  @Watch("effect")
  changeAnimation(newValue: Effect) {
    if (this.inker) {
      this.inker.stop();
      this.inker = start(this.canvas, newValue, this.hue);
    }
  }

  @Watch("hue")
  changeHue(newValue: number) {
    if (this.inker) {
      this.inker.stop();
      this.inker = start(this.canvas, this.effect, newValue);
    }
  }

  componentWillLoad() {
    window.addEventListener("resize", this.resize);
  }

  componentDidUnload() {
    window.removeEventListener("resize", this.resize);
    this.inker.stop();
  }

  resize = () => {
    const rect = this.wrapper.getBoundingClientRect();
    this.height = rect.height;
    this.width = rect.width;
  };

  touch = (e: TouchEvent) => {
    if (this.inker) {
      this.inker.notify(e.touches[0].pageX, e.touches[0].pageY);
      this.inker.ink(e.touches[0].pageX, e.touches[0].pageY);
    }
  };

  drag = (e: MouseEvent) => {
    if (this.inker) {
      this.inker.notify(e.pageX, e.pageY);
      if (e.buttons > 0) {
        this.inker.ink(e.pageX, e.pageY);
      }
    }
  };

  ready = (el: HTMLCanvasElement) => {
    if (!this.inker) {
      this.canvas = el;
      this.inker = start(el, this.effect, this.hue);
    }
  };

  render() {
    return (
      <div
        class="wrapper"
        ref={(el: HTMLDivElement) => {
          this.wrapper = el;
          el.addEventListener("touchmove", this.touch, { passive: true });
        }}
        onMouseMove={this.drag}
      >
        <canvas height={this.height} width={this.width} ref={this.ready} />
        <slot />
      </div>
    );
  }
}

Tunnel.injectProps(WhatADrag, ["effect", "hue", "dispatch"]);
