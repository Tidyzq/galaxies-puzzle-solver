type Point = { x: number; y: number };

const getCentralSymmetricPoint = (
  x: number,
  y: number,
  centerPoint: Point
): Point => ({
  x: centerPoint.x - x,
  y: centerPoint.y - y,
});

const forEachCenterCell = (centerPoint: Point, cb: (point: Point) => void) => {
  (centerPoint.x % 2
    ? [(centerPoint.x - 1) / 2, (centerPoint.x + 1) / 2]
    : [centerPoint.x / 2]
  ).forEach((x) => {
    (centerPoint.y % 2
      ? [(centerPoint.y - 1) / 2, (centerPoint.y + 1) / 2]
      : [centerPoint.y / 2]
    ).forEach((y) => {
      cb({ x, y });
    });
  });
};

const forEachDir = ({ x, y }: Point, cb: (point: Point) => void) => {
  cb({
    x,
    y: y - 1,
  });
  cb({
    x,
    y: y + 1,
  });
  cb({
    x: x - 1,
    y,
  });
  cb({
    x: x + 1,
    y,
  });
};

export function galaxiesSolver(
  centerPointsMap: number[][],
): number[][] {
  const centerPointsSize = centerPointsMap.length;
  const puzzleSize = (centerPointsSize + 1) / 2
  let centerPointsCount = 0;

  const centerPoints: Point[] = [];

  const puzzleMap = Array(puzzleSize)
    .fill(null)
    .map(() => Array<number>(puzzleSize).fill(-1));

  const possibleCenterMap = Array(puzzleSize)
    .fill(null)
    .map(() =>
      Array(puzzleSize)
        .fill(null)
        .map(() => [] as number[])
    );

  const clearPossible = () => {
    for (let x = 0; x < puzzleSize; x += 1) {
      for (let y = 0; y < puzzleSize; y += 1) {
        possibleCenterMap[x][y] = [];
      }
    }
  };

  // 1. mark center points
  for (let x = 0; x < centerPointsSize; x += 1) {
    for (let y = 0; y < centerPointsSize; y += 1) {
      if (centerPointsMap[x][y]) {
        const centerPointIndex = centerPoints.length;
        centerPoints.push({ x, y });
        forEachCenterCell({ x, y }, ({ x, y }) => {
          puzzleMap[x][y] = centerPointIndex;
        });
        centerPointsCount += 1;
      }
    }
  }

  // 2. mark possible center point for each cell
  const markPossibleForCenterPoint = (
    centerPoint: Point,
    centerPointIndex: number
  ) => {
    const queue: Point[] = [];

    forEachCenterCell(centerPoint, (p) => queue.push(p));

    while (queue.length) {
      const { x, y } = queue.shift()!;

      if (x < 0 || x >= puzzleSize || y < 0 || y >= puzzleSize) continue;
      if (puzzleMap[x][y] !== -1 && puzzleMap[x][y] !== centerPointIndex)
        continue;
      if (possibleCenterMap[x][y].includes(centerPointIndex)) continue;

      const { x: sx, y: sy } = getCentralSymmetricPoint(x, y, centerPoint);
      if (sx < 0 || sx >= puzzleSize || sy < 0 || sy >= puzzleSize) continue;
      if (puzzleMap[sx][sy] !== -1 && puzzleMap[x][y] !== centerPointIndex)
        continue;

      possibleCenterMap[x][y].push(centerPointIndex);
      if (x !== sx || y !== sy)
        possibleCenterMap[sx][sy].push(centerPointIndex);

      forEachDir({ x, y }, (p) => queue.push(p));
    }
  };

  centerPoints.forEach(markPossibleForCenterPoint);

  // 3. find determined cell
  let findDetermined = false;
  do {
    findDetermined = false;
    for (let x = 0; x < puzzleSize; x += 1) {
      for (let y = 0; y < puzzleSize; y += 1) {
        if (puzzleMap[x][y] === -1 && possibleCenterMap[x][y].length === 1) {
          const centerPointIndex = possibleCenterMap[x][y][0];
          const centerPoint = centerPoints[centerPointIndex]!;
          const { x: sx, y: sy } = getCentralSymmetricPoint(x, y, centerPoint);
          puzzleMap[x][y] = puzzleMap[sx][sy] = centerPointIndex;
          findDetermined = true;
        }
      }
    }
    if (findDetermined) {
      clearPossible();
      centerPoints.forEach(markPossibleForCenterPoint);
    }
  } while (findDetermined);

  const validate = (): boolean => {
    const meet = Array(puzzleSize)
      .fill(null)
      .map(() => Array<number>(puzzleSize).fill(0));

    centerPoints.forEach((centerPoint, centerPointIndex) => {
      const queue: Point[] = [];

      forEachCenterCell(centerPoint, (p) => queue.push(p));

      while (queue.length) {
        const { x, y } = queue.shift()!;

        if (x < 0 || x >= puzzleSize || y < 0 || y >= puzzleSize) continue;
        if (meet[x][y]) continue;
        if (puzzleMap[x][y] !== centerPointIndex) continue;

        meet[x][y] = 1;
        forEachDir({ x, y }, (p) => queue.push(p));
      }
    });

    return meet.every((meet) => meet.every((m) => !!m));
  };

  // 4. dfs
  const dfs = (x: number, y: number): boolean => {
    if (y >= puzzleSize) return validate();

    if (x >= puzzleSize) return dfs(0, y + 1);
    if (puzzleMap[x][y] !== -1) return dfs(x + 1, y);

    const possibles = possibleCenterMap[x][y];

    for (const possibleCenterPointIndex of possibles) {
      const possibleCenterPoint = centerPoints[possibleCenterPointIndex]!;
      const { x: sx, y: sy } = getCentralSymmetricPoint(
        x,
        y,
        possibleCenterPoint
      );
      if (puzzleMap[sx][sy] !== -1) continue;

      puzzleMap[x][y] = puzzleMap[sx][sy] = possibleCenterPointIndex;

      // clearPossible();
      // centerPoints.forEach(markPossibleForCenterPoint);

      if (dfs(x + 1, y)) return true;

      puzzleMap[x][y] = puzzleMap[sx][sy] = -1;

      // clearPossible();
      // centerPoints.forEach(markPossibleForCenterPoint);
    }
    return false;
  };

  dfs(0, 0);

  return puzzleMap;
}

export function coloringMap(
  puzzleMap: number[][],
): number[][] {
  const puzzleSize = puzzleMap.length
  let centerCount = 0

  for (let y = 0; y < puzzleSize; y += 1) {
    for (let x = 0; x < puzzleSize; x += 1) {
      centerCount = Math.max(centerCount, puzzleMap[x][y] + 1);
    }
  }

  const edges = Array(centerCount)
    .fill(null)
    .map(() => Array<number>(centerCount).fill(0));

  const meet = Array(puzzleSize)
    .fill(null)
    .map(() => Array<number>(puzzleSize).fill(0));

  for (let y = 0; y < puzzleSize; y += 1) {
    for (let x = 0; x < puzzleSize; x += 1) {
      if (puzzleMap[x][y] === -1) continue;

      const index = puzzleMap[x][y];
      const queue: Point[] = [];
      queue.push({ x, y });

      while (queue.length) {
        const { x, y } = queue.shift()!;

        if (x < 0 || x >= puzzleSize || y < 0 || y >= puzzleSize) continue;

        if (meet[x][y]) continue;
        if (puzzleMap[x][y] === -1) continue;
        if (puzzleMap[x][y] !== index) {
          const neighbor = puzzleMap[x][y];
          edges[index][neighbor] = edges[neighbor][index] = 1;
          continue;
        }

        meet[x][y] = 1;

        forEachDir({ x, y }, (p) => queue.push(p));
      }
    }
  }

  const colorMap = Array<number>(centerCount).fill(-1);
  let reverseCount = 0

  const dfs = (index: number): boolean => {
    if (index >= centerCount) return true
    for (let c = 0; c < 4; c += 1) {
      let conflict = false
      for (let i = 0; i < centerCount; i += 1) {
        if (i === index) continue

        if (edges[index][i] && colorMap[i] === c) {
          conflict = true
          break;
        }
      }
      if (!conflict) {
        colorMap[index] = c
        if (dfs(index + 1)) return true
        reverseCount += 1
        colorMap[index] = -1
      }
    }
    return false
  }

  dfs(0)

  return Array(puzzleSize)
    .fill(null)
    .map((_, x) =>
      Array<number>(puzzleSize)
        .fill(0)
        .map((_, y) =>
          puzzleMap[x][y] !== -1 ? colorMap[puzzleMap[x][y]] : -1
        )
    );
}
