import Tile from "./Tile";
import * as tileMaps from "./tileMaps";
import { assert, getRandomInt, zeroedArray } from "./util";

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let rendered = false;
let time;

const gameLoop = (map: tileMaps.ITileMap, renderer: tileMaps.TileMapRenderer) => {
  const now = new Date().getTime();
  const dt = now - (time || now);
  time = now;

  const recurse = (delta) => gameLoop(map, renderer);
  if (!rendered) {
    renderer(map);
    rendered = true;
  }
  requestAnimationFrame(recurse);
};

class Room extends tileMaps.TileMap {
  public readonly x;
  public readonly y;
  constructor(public readonly parent: tileMaps.ITileMap, region: tileMaps.IRegion) {
    super(parent.getRegion(region).tiles, region.width);

    this.x = region.x;
    this.y = region.y;
  }
}

function getRandomRooms(tileMap: tileMaps.ITileMap, numRooms: number): Room[] {
  return zeroedArray(getRandomInt(3, 9)).map(() => {
    const width = getRandomInt(10, 20);
    const height = getRandomInt(10, 20);
    const x = getRandomInt(0, tileMap.width - width);
    const y = getRandomInt(0, tileMap.height - height);
    return new Room(tileMap, { x, y, width, height });
  });
}

function createRooms(tileMap: tileMaps.ITileMap): tileMaps.ITileMap {
  const rooms = getRandomRooms(tileMap, 10);

  return rooms.reduce(
    (map, room) => map.fillRegion(room, Tile.Floor), tileMap);
}

const mapCreationLayers = [
  createRooms,
];

const mapWidth = 120;
const mapHeight = 80;
const map = tileMaps.TileMap.NewEmpty(mapWidth, mapHeight)
  .applyProcessors(mapCreationLayers);

const tileWidth = 5;
const tileHeight = 5;

const render = (tileMap: tileMaps.ITileMap) => {
  tileMap.tiles.map((tile, i) => {
    const x = map.coords.getX(i);
    const y = map.coords.getY(i);
    ctx.fillStyle = (tile === Tile.Floor) ? "#FFF" : "#000";
    ctx.fillRect(x * tileWidth, y * tileHeight, 10, 10);
  });
};

gameLoop(map, render);
