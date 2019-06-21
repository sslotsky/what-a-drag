import { Component, h } from "@stencil/core";

interface Dot {
  x: number;
  y: number;
  opacity: number;
}

interface Inker {
  ink: (x: number, y: number) => void;
  stop: () => void;
}

function start(canvas: HTMLCanvasElement) {
  const dots: Dot[] = [];

  function ink(x: number, y: number) {
    dots.push({ x, y, opacity: 100 });
  }

  const context = canvas.getContext("2d");

  let requestId;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = dots.length; i > 0; i--) {
      const dot = dots[i - 1];
      if (dot.opacity === 0) {
        dots.splice(i - 1, 1);
        continue;
      }

      dot.opacity = dot.opacity - 1;
      context.fillStyle = `rgba(0, 0, 0, ${dot.opacity / 100})`;
      context.fillRect(dot.x, dot.y, 5, 5);
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
