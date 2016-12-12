export interface IPlayer {
  x: number;
  y: number;
}

export class Player {
  constructor(readonly x, readonly y) { }
}
