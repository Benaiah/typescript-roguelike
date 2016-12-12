import { GameRenderer, GameState, IGameState } from "./GameState";
import { getNewLevel } from "./mapCreation";
import { Player } from "./Player";
import Tile from "./Tile";
import * as tileMaps from "./tileMaps";
import { assert, getRandomInt, range, zeroedArray } from "./util";

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let rendered = false;
let time;

const gameLoop = (state: IGameState, renderer: GameRenderer) => {
  const now = new Date().getTime();
  const dt = now - (time || now);
  time = now;

  const recurse = (newState) => () => gameLoop(newState, renderer);
  if (!rendered) {
    renderer(state);
    rendered = true;
  }
  requestAnimationFrame( recurse(new GameState(state.map, state.player)) );
};

const mapWidth = 120;
const mapHeight = 80;
const map = getNewLevel(mapWidth, mapHeight);
const startingTile = (() => {
  const openTiles = map.tiles
    .map((t, i) => { return { tile: t, x: map.coords.getX(i), y: map.coords.getY(i) }; })
    .filter((t) => t.tile !== Tile.Nothing && t.tile !== Tile.Wall);

  return openTiles[getRandomInt(0, openTiles.length)];
})();
const player = new Player(startingTile.x, startingTile.y);

const tileWidth = 5;
const tileHeight = 5;

const initialState = new GameState(map, player);

const render = (state: IGameState) => {
  // render tiles
  const tileMap = state.map;
  tileMap.tiles.map((tile, i) => {
    const x = map.coords.getX(i);
    const y = map.coords.getY(i);
    ctx.fillStyle = ((tileType: Tile): string => {
      if (tile === Tile.Floor) {
        return "#fff";
      } else if (tile === Tile.Wall) {
        return "#555";
      } else {
        return "#003";
      }
    })(tile);
    ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
  });

  // render player
  ctx.fillStyle = "#F00";
  ctx.fillRect(state.player.x * tileWidth, state.player.y * tileHeight, tileWidth, tileHeight);
};

gameLoop(initialState, render);
