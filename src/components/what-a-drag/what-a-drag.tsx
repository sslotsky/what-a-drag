import { Component, h, State, Watch } from "@stencil/core";

import { Dot, fader, cruiser, gravity } from "./effects";

interface Inker {
  ink: (x: number, y: number) => void;
  notify: (x: number, y: number) => void;
  stop: () => void;
}

export type DotType = "fader" | "cruiser" | "gravity";

const dotMaker = { fader, cruiser, gravity };

function start(canvas: HTMLCanvasElement, type: DotType) {
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

      context.fillStyle = dot.style();
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
  inker?: Inker;
  @State() height: number = window.innerHeight;
  @State() width: number = window.innerWidth;
  @State() dotType: DotType = "fader";

  @Watch("dotType")
  changeAnimation(newValue: DotType) {
    if (this.inker) {
      this.inker.stop();
      this.inker = start(this.canvas, newValue);
    }
  }

  componentWillLoad() {
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("touchmove", this.touch);
    window.addEventListener("resize", this.resize);
  }

  componentDidUnload() {
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("touchmove", this.touch);
    window.removeEventListener("resize", this.resize);
    this.inker.stop();
  }

  resize = () => {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
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
      this.inker = start(el, this.dotType);
    }
  };

  render() {
    return (
      <div class="wrapper">
        <canvas height={this.height} width={this.width} ref={this.ready} />
        <div class="controls">
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
      </div>
    );
  }
}
