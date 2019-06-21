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

function gravity(x: number, y: number): Dot {
  const speedConstant = Math.pow(9.8, 2);
  let foundTheMouse = false;
  const attributes = {
    position: { x, y },
    wait: 90,
    speed: 0,
    lastMouse: { x, y },
    origin: { x, y }
  };

  function distance(point: Position) {
    const deltaX = attributes.lastMouse.x - point.x;
    const deltaY = attributes.lastMouse.y - point.y;
    const distance = Math.sqrt(
      Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2)
    );

    return { deltaX, deltaY, distance };
  }

  const tick = () => {
    if (attributes.wait > 0) {
      attributes.wait--;
      return;
    }

    const { deltaX, deltaY, distance: d } = distance(attributes.position);

    attributes.speed += speedConstant / d;

    if (attributes.speed >= d) {
      foundTheMouse = true;
    }

    const factor = attributes.speed / d;
    attributes.position.x += deltaX * factor;
    attributes.position.y += deltaY * factor;
  };

  const notify = (nextX: number, nextY: number) => {
    attributes.lastMouse = { x: nextX, y: nextY };
  };

  const done = () => foundTheMouse;

  const style = () => {
    const saturation = (attributes.position.y * 100) / window.innerHeight;
    const light = (attributes.position.x * 100) / window.innerWidth;
    const originDistance = distance(attributes.origin).distance;
    const currentDistance = distance(attributes.position).distance;
    const alpha = currentDistance / originDistance;
    return `hsla(170, ${saturation}%, ${light}%, ${alpha})`;
  };

  const position = () => attributes.position;

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
  Gravity
}

const dotMaker = {
  [DotType.Fader]: fader,
  [DotType.Cruiser]: cruiser,
  [DotType.Gravity]: gravity
};

function start(canvas: HTMLCanvasElement, type = DotType.Gravity) {
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
