interface Position {
  x: number;
  y: number;
}

export interface Dot {
  position: () => Position;
  notify: (x: number, y: number) => void;
  tick: () => void;
  done: () => boolean;
  style: () => string;
}

export function fader(x: number, y: number): Dot {
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

export function gravity(x: number, y: number): Dot {
  const speedConstant = Math.pow(9.8, 2);
  let foundTheMouse = false;
  const attributes = {
    position: { x, y },
    wait: 90,
    speed: 0,
    lastMouse: { x, y },
    origin: { x, y }
  };

  function triangle(point: Position) {
    const deltaX = attributes.lastMouse.x - point.x;
    const deltaY = attributes.lastMouse.y - point.y;
    const distance = Math.sqrt(
      Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2)
    );

    return { a: deltaX, b: deltaY, c: distance };
  }

  const tick = () => {
    if (attributes.wait > 0) {
      attributes.wait--;
      return;
    }

    const { a: deltaX, b: deltaY, c: distance } = triangle(attributes.position);

    attributes.speed += speedConstant / distance;

    if (attributes.speed >= distance) {
      foundTheMouse = true;
    }

    const factor = attributes.speed / distance;
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
    const originDistance = triangle(attributes.origin).c;
    const currentDistance = triangle(attributes.position).c;
    const alpha = currentDistance / originDistance;
    return `hsla(20, ${saturation}%, ${light}%, ${alpha})`;
  };

  const position = () => attributes.position;

  return { position, tick, notify, done, style };
}

export function cruiser(x: number, y: number): Dot {
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
