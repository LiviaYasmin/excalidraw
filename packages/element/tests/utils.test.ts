import { pointFrom } from "@excalidraw/math";

import type { LocalPoint } from "@excalidraw/math";

import { isPathALoop } from "../src/utils";

import { LINE_CONFIRM_THRESHOLD } from "@excalidraw/common";

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

  // CT04: extremidades coincidentes devem ser reconhecidas como fechamento
  it("returns true when the first and last points coincide", () => {
    expect(isPathALoop(pointsWithGap(0))).toBe(true);
  });

  // CT05: uma lacuna exatamente no limite permitido ainda deve ser aceita
  it("accepts a closure gap exactly at the threshold", () => {
    expect(isPathALoop(pointsWithGap(LINE_CONFIRM_THRESHOLD))).toBe(true);
  });

  // CT07: o ponto intermediário não muda o resultado se as extremidades forem mantidas
  it("uses only the first and last points to detect closure", () => {
    const points = [
      pointFrom<LocalPoint>(0, 0),
      pointFrom<LocalPoint>(100, 100),
      pointFrom<LocalPoint>(LINE_CONFIRM_THRESHOLD, 0),
    ];

    expect(isPathALoop(points)).toBe(true);
  });

});