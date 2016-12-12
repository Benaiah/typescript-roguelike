import { IPlayer } from "./Player";
import { ITileMap } from "./tileMaps";
import Tile from "./Tile";

export interface IGameState {
  map: ITileMap<Tile>;
  player: IPlayer;
}

export type GameRenderer = { (GameState: IGameState): void };

export class GameState implements IGameState {
  constructor (readonly map: ITileMap<Tile>, readonly player: IPlayer) { }
}
