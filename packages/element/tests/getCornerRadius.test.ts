import {
  DEFAULT_ADAPTIVE_RADIUS,
  DEFAULT_PROPORTIONAL_RADIUS,
  ROUNDNESS,
} from "@excalidraw/common";

import { getCornerRadius } from "../src/utils";

import type { ExcalidrawElement } from "../src/types";

// cria um elemento só com o que a função observa: o tipo de arredondamento
const rect = (roundness: { type: number; value?: number } | null) =>
  ({ type: "rectangle", roundness } as unknown as ExcalidrawElement);

describe("getCornerRadius - caixa preta", () => {
  // CT01: sem arredondamento, o canto é reto
  it("CT01: returns 0 when the element has no roundness", () => {
    expect(getCornerRadius(100, rect(null))).toBe(0);
  });

  // CT02 e CT03: arredondamento proporcional usa 25% do tamanho
  it("CT02-CT03: returns 25% of the size for legacy and proportional roundness", () => {
    expect(getCornerRadius(100, rect({ type: ROUNDNESS.LEGACY }))).toBe(25);
    expect(
      getCornerRadius(100, rect({ type: ROUNDNESS.PROPORTIONAL_RADIUS })),
    ).toBe(25);
  });

  // CT04 a CT06: adaptativo, valores limite em torno de 128 (32 / 0.25)
  it("CT04-CT06: adaptive roundness around the 128px limit", () => {
    const adaptive = rect({ type: ROUNDNESS.ADAPTIVE_RADIUS });
    const limit = DEFAULT_ADAPTIVE_RADIUS / DEFAULT_PROPORTIONAL_RADIUS; // 128

    expect(getCornerRadius(limit - 1, adaptive)).toBe(31.75); // logo abaixo
    expect(getCornerRadius(limit, adaptive)).toBe(32); // no limite
    expect(getCornerRadius(limit + 1, adaptive)).toBe(32); // logo acima: fixo
  });

  // CT07: tamanho zero não gera raio
  it("CT07: returns 0 for size 0 with adaptive roundness", () => {
    expect(
      getCornerRadius(0, rect({ type: ROUNDNESS.ADAPTIVE_RADIUS })),
    ).toBe(0);
  });

  // CT08 a CT10: adaptativo com valor próprio (10px), limite passa a ser 40
  it("CT08-CT10: adaptive roundness with a custom value", () => {
    const custom = rect({ type: ROUNDNESS.ADAPTIVE_RADIUS, value: 10 });

    expect(getCornerRadius(39, custom)).toBe(9.75);
    expect(getCornerRadius(40, custom)).toBe(10);
    expect(getCornerRadius(100, custom)).toBe(10);
  });
});
