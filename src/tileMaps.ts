import * as coords from "./coords";
import Tile from "./Tile";
import { assert, zeroedArray } from "./util";

export interface IRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ITileMap {
  width: number;
  height: number;
  tiles: Tile[];
  coords: coords.ICoordinateSystem;
  getRegion: (region: IRegion) => ITileMap;
  fillRegion: (region: IRegion, contents: Tile) => ITileMap;
  applyProcessors: (processors: TileMapProcessor[]) => ITileMap;
}

export type TileMapProcessor = { (tileMap: ITileMap): ITileMap };
export type TileMapRenderer = { (tileMap: ITileMap): void };

export class TileMap {
  public static NewEmpty(width: number, height: number) {
    const length = width * height;
    const tiles: Tile[] = zeroedArray(length);
    return new TileMap(tiles, width);
  }

  public readonly tiles: Tile[];
  public coords: coords.RowFirstCoordinates;
  public readonly height: number;
  public readonly width: number;
  constructor(tiles: Tile[], width: number) {
    assert(tiles.length % width === 0);
    this.width = width;
    this.height = tiles.length / width;
    this.coords = new coords.RowFirstCoordinates(width);
    this.tiles = tiles;
  }

  public getRegion(region: IRegion): TileMap {
    const { x, y, width, height } = region;
    assert((x + width <= this.width) && (y + height <= this.height));
    const regionTiles = this.tiles.filter((tile, i) => {
      const tileX = this.coords.getX(i);
      const tileY = this.coords.getY(i);
      if ((tileX >= x && tileX < x + width) && (tileY >= y && tileY < y + height)) {
        return true;
      } else {
        return false;
      }
    });

    return new TileMap(regionTiles, width);
  }
  public fillRegion(region: IRegion, contents: number): TileMap {
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

    return new TileMap(newTiles, this.width);
  }
  public applyProcessors(processors: TileMapProcessor[]): ITileMap {
    return processors.reduce((map, processor) => processor(map), this as ITileMap);
  }
}
