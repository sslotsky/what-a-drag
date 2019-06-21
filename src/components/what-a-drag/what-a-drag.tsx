import { Component, h } from "@stencil/core";

interface Dot {
  x: number;
  y: number;
  notify: (x: number, y: number) => void;
  tick: () => void;
  done: () => boolean;
  style: () => string;
}

function fader(x: number, y: number) {
  const attributes = { x, y, opacity: 100 };

  const tick = () => {
    attributes.opacity--;
  };

  const notify = () => {};

  const done = () => attributes.opacity === 0;

  const style = () => `rgba(0, 0, 0, ${attributes.opacity / 100})`;

  return { ...attributes, tick, notify, done, style };
}

interface Inker {
  ink: (x: number, y: number) => void;
  stop: () => void;
}

enum DotType {
  Fader
}

const dotMaker = {
  [DotType.Fader]: fader
};

function start(canvas: HTMLCanvasElement, type = DotType.Fader) {
  const dots: Dot[] = [];

  function ink(x: number, y: number) {
    for (let dot of dots) {
      dot.notify(x, y);
    }

    const factory = dotMaker[type] || fader;
    dots.push(factory(x, y));
  }

  const context = canvas.getContext("2d");

  let requestId;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = dots.length; i > 0; i--) {
      const dot = dots[i - 1];

      if (dot.done()) {
        dots.splice(i - 1, 1);
        continue;
      }

      context.fillStyle = dot.style();
      context.fillRect(dot.x, dot.y, 5, 5);

      dot.tick();
    }

    requestId = requestAnimationFrame(draw);
  }

  draw();

  return { ink, stop: () => cancelAnimationFrame(requestId) };
}

@Component({
  tag: "what-a-drag",
  styleUrl: "style.css",
  shadow: true
})
export class WhatADrag {
  canvas?: HTMLCanvasElement;
  inker?: Inker;

  componentWillLoad() {
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("click", this.click);
    document.addEventListener("touchmove", this.touch);
  }

  componentDidUnload() {
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("click", this.click);
    document.removeEventListener("touchmove", this.touch);
    this.inker.stop();
  }

  touch = (e: TouchEvent) => {
    if (this.inker) {
      this.inker.ink(e.touches[0].pageX, e.touches[0].pageY);
    }
  };

  drag = (e: MouseEvent) => {
    if (this.inker && e.buttons > 0) {
      this.inker.ink(e.pageX, e.pageY);
    }
  };

  click = (e: MouseEvent) => {
    if (this.inker) {
      this.inker.ink(e.pageX, e.pageY);
    }
  };

  ready = (el: HTMLCanvasElement) => {
    if (!this.inker) {
      this.inker = start(el);
    }
  };

  render() {
    return (
      <canvas
        height={window.innerHeight}
        width={window.innerWidth}
        ref={this.ready}
      />
    );
  }
}
