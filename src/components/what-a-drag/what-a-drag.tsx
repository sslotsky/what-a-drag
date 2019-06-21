import { Component, h } from "@stencil/core";

interface Inker {
  ink: (x: number, y: number) => void;
  stop: () => void;
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

  let requestId;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let [xCoord, x] of inkMap.entries()) {
      for (let [yCoord, count] of x.entries()) {
        for (let i = count; i > 0; i--) {
          context.fillRect(xCoord, yCoord, 5, 5);
        }
      }
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
    document.addEventListener("touchstart", this.touch);
    document.addEventListener("touchmove", this.touch);
  }

  componentDidUnload() {
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("click", this.click);
    document.removeEventListener("touchstart", this.touch);
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
