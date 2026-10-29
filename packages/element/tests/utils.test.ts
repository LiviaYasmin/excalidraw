import { pointFrom } from "@excalidraw/math";

import type { LocalPoint } from "@excalidraw/math";

import { isPathALoop } from "../src/utils";

const pointsWithGap = (gap: number): LocalPoint[] => [
  pointFrom<LocalPoint>(0, 0),
  pointFrom<LocalPoint>(30, 40),
  pointFrom<LocalPoint>(gap, 0),
];

describe("isPathALoop", () => {
  // CT01–CT03: caminhos com zero, um ou dois pontos não formam um loop
  it("returns false when the path has fewer than three points", () => {
    const shortPaths: LocalPoint[][] = [
      [],
      [pointFrom<LocalPoint>(0, 0)],
      pointsWithGap(0).slice(0, 2),
    ];

    for (const points of shortPaths) {
      expect(isPathALoop(points)).toBe(false);
    }
  });
});