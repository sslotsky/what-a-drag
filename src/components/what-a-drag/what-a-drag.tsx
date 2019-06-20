import { Component, h } from "@stencil/core";

interface Inker {
  ink: (x: number, y: number) => void;
}

function start(canvas: HTMLCanvasElement) {
  const inkMap = new Map<number, Map<number, number>>();

  function ink(x: number, y: number) {
    const map = inkMap.get(x) || new Map();
    const inkCount = map.get(y) || 0;
    map.set(y, inkCount + 1);
    inkMap.set(x, map);
    console.log(x, y);
  }

  const context = canvas.getContext("2d");
  context.fillStyle = "black";

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let [xCoord, x] of inkMap.entries()) {
      for (let [yCoord, count] of x.entries()) {
        for (let i = count; i > 0; i--) {
          context.fillRect(xCoord, yCoord, 5, 5);
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();

  return { ink };
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
  }

  drag = (e: MouseEvent) => {
    if (this.inker && e.buttons > 0) {
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
