import { pointFrom } from "@excalidraw/math";

import type { LocalPoint } from "@excalidraw/math";

import { isPathALoop } from "../src/utils";

import { LINE_CONFIRM_THRESHOLD } from "@excalidraw/common";

import type { NormalizedZoomValue } from "@excalidraw/excalidraw/types";

const pointsWithGap = (gap: number): LocalPoint[] => [
  pointFrom<LocalPoint>(0, 0),
  pointFrom<LocalPoint>(30, 40),
  pointFrom<LocalPoint>(gap, 0),
];

describe("isPathALoop", () => {
  // caminhos com zero, um ou dois pontos não formam um loop
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

  // extremidades coincidentes devem ser reconhecidas como fechamento
  it("returns true when the first and last points coincide", () => {
    expect(isPathALoop(pointsWithGap(0))).toBe(true);
  });

  // uma lacuna exatamente no limite permitido ainda deve ser aceita
  it("accepts a closure gap exactly at the threshold", () => {
    expect(isPathALoop(pointsWithGap(LINE_CONFIRM_THRESHOLD))).toBe(true);
  });

  // o ponto intermediário não muda o resultado se as extremidades forem mantidas
  it("uses only the first and last points to detect closure", () => {
    const points = [
      pointFrom<LocalPoint>(0, 0),
      pointFrom<LocalPoint>(100, 100),
      pointFrom<LocalPoint>(LINE_CONFIRM_THRESHOLD, 0),
    ];

    expect(isPathALoop(points)).toBe(true);
  });

  // uma lacuna logo acima do limite deve ser rejeitada
  it("rejects a closure gap just above the threshold", () => {
    expect(
      isPathALoop(pointsWithGap(LINE_CONFIRM_THRESHOLD + 0.001)),
    ).toBe(false);
  });

  // com zoom 2 -> testa o limite menor e o primeiro valor acima dele
  it("reduces the accepted gap when zoomed in", () => {
    expect(
      isPathALoop(
        pointsWithGap(LINE_CONFIRM_THRESHOLD / 2),
        2 as NormalizedZoomValue,
      ),
    ).toBe(true);

    expect(
      isPathALoop(
        pointsWithGap(LINE_CONFIRM_THRESHOLD / 2 + 0.001),
        2 as NormalizedZoomValue,
      ),
    ).toBe(false);
  });

  // com zoom 0,5 -> testa o limite maior e o primeiro valor acima dele
  it("increases the accepted gap when zoomed out", () => {
    expect(
      isPathALoop(
        pointsWithGap(LINE_CONFIRM_THRESHOLD * 2),
        0.5 as NormalizedZoomValue,
      ),
    ).toBe(true);

    expect(
      isPathALoop(
        pointsWithGap(LINE_CONFIRM_THRESHOLD * 2 + 0.001),
        0.5 as NormalizedZoomValue,
      ),
    ).toBe(false);
  });

});


// -------- CASOS DE TESTE CAIXA BRANCA (isPathALoop) --------
const createLoopPoints = (gap: number): LocalPoint[] => [
  pointFrom<LocalPoint>(0, 0),
  pointFrom<LocalPoint>(10, 10),
  pointFrom<LocalPoint>(0, gap),
];

describe("isPathALoop - Caixa Branca (MC/DC)", () => {
  it("should return false when path has fewer than 3 points", () => {
    expect(isPathALoop([])).toBe(false);
    expect(isPathALoop([pointFrom<LocalPoint>(0, 0)])).toBe(false);
    expect(
      isPathALoop([pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(0, 0)]),
    ).toBe(false);
  });
});