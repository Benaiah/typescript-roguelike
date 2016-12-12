import Tile from "./Tile";
import * as tileMaps from "./tileMaps";
import { assert, getRandomInt, range, zeroedArray } from "./util";

class Room extends tileMaps.TileMap<Tile> {
  public static FromParent(parent: tileMaps.ITileMap<Tile>, region: tileMaps.IRegion): Room {
    return new Room(parent.getRegion(region).tiles, region.width, region.x, region.y);
  }

  constructor(tiles, width, public readonly x, public readonly y) {
    super(tiles, width);
  }

  public collidesWith(other: tileMaps.IRegion) {
    return ((this.x < other.x + other.width) &&
      (this.x + this.width > other.x) &&
      (this.y < other.y + other.height) &&
      (this.height + this.y > other.y));
  }

  public fillFloor(contents: Tile): Room {
    const newTiles = this.tiles.map((tile, i) => {
      const x = this.coords.getX(i);
      const y = this.coords.getY(i);

      if (x !== 0 && y !== 0 && x !== this.width - 1 && y !== this.height - 1) {
        return contents;
      } else {
        return tile;
      }
    });

    return new Room(newTiles, this.width, this.x, this.y);
  }
  public fillWalls(contents: Tile): Room {
    const newTiles = this.tiles.map((tile, i) => {
      const x = this.coords.getX(i);
      const y = this.coords.getY(i);

      if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
        return contents;
      } else {
        return tile;
      }
    });

    return new Room(newTiles, this.width, this.x, this.y);
  }
}

interface IRoomsAndConnections {
  rooms: any[];
  connections: number[][];
}

function getRoomsAndConnections(tileMap: tileMaps.ITileMap<Tile>, numRooms: number): IRoomsAndConnections {
  const rooms = range(numRooms);

  const uniquityFilter = (val, i, self) => self.indexOf(val) === i;

  const path = [
    0,
    ...rooms.slice(1, -2)
      .filter(() => getRandomInt(0, 3) !== 3)
      .sort(() => getRandomInt(-1, 1)),
    1,
  ];

  const pathConnections = path.reduce((result, roomIndex, i) => {
    if (i >= self.length - 1) {
      return result;
    } else {
      const connectedTo = path[i + 1];
      return [...result, [roomIndex, connectedTo]];
    }
  }, []);

  const otherConnections = range(rooms.length).reduce((result, roomIndex, i) => {
    return [
      ...result,
      ...rooms.filter((_, otherRoomI) => otherRoomI !== roomIndex)
        .filter(() => getRandomInt(0, 3) === 0)
        .map((it) => [roomIndex, it]),
    ];
  }, []);

  return {
    rooms,
    connections: [
      ...pathConnections,
      ...otherConnections,
    ].map((it) => it.sort()).filter(uniquityFilter),
  };
}

function createRooms(tileMap: tileMaps.ITileMap<Tile>): tileMaps.ITileMap<Tile> {
  const roomsAndConnections = getRoomsAndConnections(tileMap, 6);

  const collidesWithAnotherRoom = (region: tileMaps.IRegion, others: Room[]): boolean => {
    return others.length > 0 && others.some((other) => other.collidesWith(region));
  };

  const realRooms = roomsAndConnections.rooms.reduce((roomsSoFar, thisRoom) => {
    let newRoomRegion;
    let newRoomCollisionCheckRegion;
    do {
      let width = getRandomInt(20, 30);
      let height = getRandomInt(20, 30);
      let x = getRandomInt(0, tileMap.width - width);
      let y = getRandomInt(0, tileMap.height - height);
      newRoomRegion = { x, y, width, height };
      newRoomCollisionCheckRegion = { x: x - 2, y: y - 2, width: width + 4, height: height + 4 };
    } while (collidesWithAnotherRoom(newRoomCollisionCheckRegion, roomsSoFar));
    return [...roomsSoFar, Room.FromParent(tileMap, newRoomRegion)];
  }, []);

  return realRooms.reduce((map, room) => map.setRegion(room.fillFloor(Tile.Floor).fillWalls(Tile.Wall)), tileMap);
}

function removeNonBorderWalls(tileMap: tileMaps.ITileMap<Tile>): tileMaps.ITileMap<Tile> {
  const newTiles = tileMap.tiles.map((tile, i) => {
    if (tile !== Tile.Wall) { return tile; }
    const x = tileMap.coords.getX(i);
    const y = tileMap.coords.getY(i);
    const neighbors = tileMap.neighbors(x, y);
    if (!neighbors.tiles.some((neighbor) => (neighbor === Tile.Nothing) || (neighbor === undefined))) {
      return Tile.Floor;
    } else {
      return tile;
    }
  });

  return new tileMaps.TileMap(newTiles, tileMap.width);
}

const mapCreationLayers = [
  createRooms,
  removeNonBorderWalls,
];

export function getNewLevel(width, height): tileMaps.ITileMap<Tile> {
  return tileMaps.TileMap
    .NewEmpty(width, height, Tile.Nothing)
    .applyProcessors(mapCreationLayers);
}
