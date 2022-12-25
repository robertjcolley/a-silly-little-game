export function generateCoordinates(
  container: { width: number; height: number },
  numberOfCoordinates: number,
  sizeOfImages: number
) {
  const xRange = { min: sizeOfImages, max: container.width - sizeOfImages * 2 };
  const yRange = {
    min: sizeOfImages,
    max: container.height - sizeOfImages * 2,
  };

  const coordinates: Point[] = [];
  let loops = 0;
  while (coordinates.length < numberOfCoordinates) {
    if (loops > 10000) throw new Error("Logic issue");

    const newRandomX = getRandomArbitrary(xRange.min, xRange.max);
    const newRandomY = getRandomArbitrary(yRange.min, yRange.max);

    let doesOverlap = false;
    for (let coordinate of coordinates) {
      if (
        doOverlap(
          { x: newRandomX, y: newRandomY },
          { x: newRandomX + sizeOfImages, y: newRandomY + sizeOfImages },
          { x: coordinate.x, y: coordinate.y },
          { x: coordinate.x + sizeOfImages, y: coordinate.y + sizeOfImages }
        )
      ) {
        doesOverlap = true;
        break;
      }
    }

    if (!doesOverlap) {
      coordinates.push({ x: newRandomX, y: newRandomY });
    }
    loops = loops + 1;
  }
  return coordinates;
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export interface Point {
  x: number;
  y: number;
}

export function doOverlap(aTL: Point, aBR: Point, bTL: Point, bBR: Point) {
  const minAx = aTL.x;
  const maxAx = aBR.x;
  const minAy = aTL.y;
  const maxAy = aBR.y;

  const minBx = bTL.x;
  const maxBx = bBR.x;
  const minBy = bTL.y;
  const maxBy = bBR.y;

  const aLeftOfB = maxAx < minBx;
  const aRightOfB = minAx > maxBx;
  const aAboveB = minAy > maxBy;
  const aBelowB = maxAy < minBy;

  return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
}
