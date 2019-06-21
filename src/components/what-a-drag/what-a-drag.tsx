import { Component, h, State } from "@stencil/core";

interface Position {
  x: number;
  y: number;
}

interface Dot {
  position: () => Position;
  notify: (x: number, y: number) => void;
  tick: () => void;
  done: () => boolean;
  style: () => string;
}

function fader(x: number, y: number): Dot {
  const attributes = { x, y, opacity: 100 };

  const tick = () => {
    attributes.opacity--;
  };

  const notify = () => {};

  const done = () => attributes.opacity === 0;

  const style = () => `rgba(0, 0, 0, ${attributes.opacity / 100})`;

  const position = () => ({ x: attributes.x, y: attributes.y });

  return { position, tick, notify, done, style };
}

function flipit(x: number, y: number): Dot {
  /* This was supposed to be a gravity effect, where the pointer
   * sucks in all the dots. It didn't work, but what I wound up
   * with was cool, so here it is.
   */

  const speedConstant = 9.8;
  const closeEnough = 5;
  const attributes = { x, y, wait: 60, speed: 0, lastMouse: { x, y } };

  const tick = () => {
    if (attributes.wait > 0) {
      attributes.wait--;
      return;
    }

    attributes.speed += speedConstant;
    const deltaX = attributes.lastMouse.x - attributes.x;
    const deltaY = attributes.lastMouse.y - attributes.y;
    attributes.x += deltaX / attributes.speed;
    attributes.y += deltaY / attributes.speed;
  };

  const notify = (nextX: number, nextY: number) => {
    attributes.lastMouse = { x: nextX, y: nextY };
  };

  const done = () => {
    return (
      attributes.wait <= 0 &&
      (Math.abs(attributes.x - attributes.lastMouse.x) <= closeEnough &&
        Math.abs(attributes.y - attributes.lastMouse.y) <= closeEnough)
    );
  };

  const style = () => `black`;

  const position = () => ({ x: attributes.x, y: attributes.y });

  return { position, tick, notify, done, style };
}

function cruiser(x: number, y: number): Dot {
  const attributes = { x, y, life: 100, delta: null };

  const tick = () => {
    attributes.life--;
    if (attributes.delta) {
      attributes.x += attributes.delta.x / 100;
      attributes.y += attributes.delta.y / 100;
    }
  };

  const notify = (nextX: number, nextY: number) => {
    if (!attributes.delta) {
      attributes.delta = { x: nextX - attributes.x, y: nextY - attributes.y };
    }
  };

  const done = () => attributes.life === 0;

  const style = () => `rgba(0, 0, 0, ${attributes.life / 100})`;

  const position = () => ({ x: attributes.x, y: attributes.y });

  return { position, tick, notify, done, style };
}

interface Inker {
  ink: (x: number, y: number) => void;
  notify: (x: number, y: number) => void;
  stop: () => void;
}

enum DotType {
  Fader,
  Cruiser,
  Flipit
}

const dotMaker = {
  [DotType.Fader]: fader,
  [DotType.Cruiser]: cruiser,
  [DotType.Flipit]: flipit
};

function start(canvas: HTMLCanvasElement, type = DotType.Flipit) {
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

  componentWillLoad() {
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("click", this.click);
    document.addEventListener("touchmove", this.touch);
    window.addEventListener("resize", this.resize);
  }

  componentDidUnload() {
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("click", this.click);
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
    return <canvas height={this.height} width={this.width} ref={this.ready} />;
  }
}
