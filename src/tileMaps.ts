import * as coords from "./coords";
import { assert, zeroedArray } from "./util";

export interface IRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ITileMap<T> {
  width: number;
  height: number;
  x: number;
  y: number;
  tiles: T[];
  coords: coords.ICoordinateSystem;
  at: (x: number, y: number) => T;
  setAt: (x: number, y: number, contents: T) => ITileMap<T>;
  neighbors: (x: number, y: number) => ITileMap<T>;
  getRegion: (region: IRegion) => ITileMap<T>;
  fillRegion: (region: IRegion, contents: T) => ITileMap<T>;
  setRegion: (region: ITileMap<T>) => ITileMap<T>;
  applyProcessors: (processors: TileMapProcessor[]) => ITileMap<T>;
}

export type TileMapProcessor = { (tileMap: ITileMap<any>): ITileMap<any> };

export class TileMap<T> {
  public static NewEmpty<T>(width: number, height: number, zeroValue: T) {
    const length = width * height;
    const tiles: T[] = Array.apply(null, Array(length)).map(() => zeroValue);
    return new TileMap<T>(tiles, width);
  }

  public readonly tiles: T[];
  public readonly coords: coords.RowFirstCoordinates;
  public readonly height: number;
  public readonly width: number;
  public readonly x: number;
  public readonly y: number;
  constructor(tiles: T[], width: number, x = 0, y = 0) {
    assert(tiles.length % width === 0);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = tiles.length / width;
    this.coords = new coords.RowFirstCoordinates(width);
    this.tiles = tiles;
  }

  public at(x: number, y: number): T {
    return this.tiles[this.coords.getI(x, y)];
  }

  public setAt(x: number, y: number, contents: T): ITileMap<T> {
    let newTiles = this.tiles.slice();
    newTiles[this.coords.getI(x, y)] = contents;
    return new TileMap<T>(newTiles, this.width);
  }

  public getRegion(region: IRegion): ITileMap<T> {
    const { x, y, width, height } = region;

    const initialTileMap = new TileMap(zeroedArray(width * height), width, x, y);

    const regionTiles = initialTileMap.tiles.map((tile, i) => {
      const tileX = initialTileMap.coords.getX(i);
      const tileY = initialTileMap.coords.getY(i);

      if ((tileX + initialTileMap.x < this.x) || (tileY + initialTileMap.y < this.y) ||
        (tileX + initialTileMap.x + initialTileMap.width - 1 > this.width) ||
        (tileY + initialTileMap.y + initialTileMap.height - 1 > this.height)) {
        return undefined;
      } else {
        return this.at(initialTileMap.x + tileX, initialTileMap.y + tileY);
      }
    });

    return new TileMap(regionTiles, width, x, y);
  }

  // Note that neighbors includes the tile at that position.
  public neighbors(x: number, y: number): ITileMap<T> {
    return this.getRegion({ x: x - 1, y: y - 1, width: 3, height: 3 });
  }

  public fillRegion(region: IRegion, contents: T): ITileMap<T> {
    const { x, y, width, height } = region;
    assert((x + width <= this.width) && (y + height <= this.height));
    const newTiles = this.tiles.map((tile, i) => {
      const tileX = this.coords.getX(i);
      const tileY = this.coords.getY(i);
      if ((tileX >= x && tileX < x + width) && (tileY >= y && tileY < y + height)) {
        return contents;
      } else {
        return tile;
      }
    });

    return new TileMap<T>(newTiles, this.width);
  }

  // setRegion supports sparse TileMaps, so tiles set to undefined will be
  // left as their original value
  public setRegion(region: ITileMap<T>): ITileMap<T> {
    const newTiles = this.tiles.map((tile, i) => {
      const tileX = this.coords.getX(i);
      const tileY = this.coords.getY(i);

      if ((tileX >= region.x) && (tileY >= region.y) &&
        (tileX < region.x + region.width) && (tileY < region.y + region.height)) {
        const newTile = region.tiles[region.coords.getI(tileX - region.x, tileY - region.y)];
        if (newTile !== undefined) {
          return newTile;
        } else {
          return tile;
        }
      } else {
        return tile;
      }
    });

    return new TileMap<T>(newTiles, this.width);
  }

  public applyProcessors(processors: TileMapProcessor[]): ITileMap<T> {
    return processors.reduce((map, processor) => processor(map), this as ITileMap<T>);
  }
}
