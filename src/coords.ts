export interface ICoordinateSystem {
  getX(i: number): number;
  getY(i: number): number;
  getI(x: number, y: number): number;
}

export class RowFirstCoordinates {
  public static GetX(i: number, width: number): number {
    return i % width;
  }
  public static GetY(i: number, width: number): number {
    return Math.floor(i / width);
  }
  public static GetI(x: number, y: number, width: number): number {
    return (y * width) + x;
  }

  // Instance methods allow you to store the width
  constructor(private width: number) { }
  public getX(i: number): number {
    return RowFirstCoordinates.GetX(i, this.width);
  }
  public getY(i: number): number {
    return RowFirstCoordinates.GetY(i, this.width);
  }
  public getI(x: number, y: number): number {
    return RowFirstCoordinates.GetI(x, y, this.width);
  }
}
