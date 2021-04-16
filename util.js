export function assert(condition, message, ...info) {
  if (!condition) {
    const e = new Error(message);
    e.name = "AssertFail";
    console.error(...info);
    throw e;
  }
}

export function fail(message, ...info) {
  const e = new Error(message);
  e.name = "Fail";
  console.error(...info);
  throw e;
}

export function sample(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}

// export function randomRange(min, max) {
//   assert(max >= min, "Bad arguments", { min, max });
//   const [low, high] = [Math.random(), Math.random()].sort();
//   const d = max - min;
//   return [low * d + min];
// }

export function capitalize(s) {
  s = s.toString();
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
