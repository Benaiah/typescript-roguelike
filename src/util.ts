export function assert(condition: boolean, message?: string) {
  if (!condition) {
    const errorMessage = (message !== undefined)
      ? "Assertion failed"
      : message;
    throw new Error(errorMessage);
  }
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function range(num: number): number[] {
  return Array.apply(null, Array(num)).map((_, i) => i);
}

export function zeroedArray(length: number): number[] {
  return Array.apply(null, Array(length)).map(Number.prototype.valueOf, 0);
}
