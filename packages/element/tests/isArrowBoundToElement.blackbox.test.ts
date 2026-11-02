import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import { isArrowBoundToElement } from "../src/typeChecks";

import type { ExcalidrawArrowElement, FixedPointBinding } from "../src/types";

// ligação válida para um elemento qualquer
const bound: FixedPointBinding = {
  elementId: "target",
  fixedPoint: [0.5, 0.5],
  mode: "orbit",
};

// remove propriedades da seta, simulando dados antigos sem esses campos
const without = (element: ExcalidrawArrowElement, ...keys: string[]) => {
  const copy: Record<string, unknown> = { ...element };
  keys.forEach((key) => delete copy[key]);
  return copy as unknown as ExcalidrawArrowElement;
};

// cria uma seta com as ligações informadas (comum ou com cotovelos)
const arrow = (
  startBinding: FixedPointBinding | null,
  endBinding: FixedPointBinding | null,
  elbowed = false,
) =>
  API.createElement({
    type: "arrow",
    elbowed,
    startBinding,
    endBinding,
  }) as ExcalidrawArrowElement;

describe("isArrowBoundToElement - caixa preta", () => {
  // CT01: seta sem nenhuma ligação
  it("CT01: returns false for an arrow with no bindings", () => {
    expect(isArrowBoundToElement(arrow(null, null))).toBe(false);
  });

  // CT02: ligações ausentes (propriedades não informadas, como em arquivos antigos)
  it("CT02: returns false when the binding properties are missing", () => {
    const missing = without(arrow(null, null), "startBinding", "endBinding");
    expect(isArrowBoundToElement(missing)).toBe(false);
  });

  // CT03 a CT05: pelo menos uma ponta ligada
  it("CT03-CT05: returns true when at least one endpoint is bound", () => {
    expect(isArrowBoundToElement(arrow(bound, null))).toBe(true); // só início
    expect(isArrowBoundToElement(arrow(null, bound))).toBe(true); // só fim
    expect(isArrowBoundToElement(arrow(bound, bound))).toBe(true); // ambas
  });

  // CT06: início ligado e fim ausente
  it("CT06: returns true when start is bound and end is missing", () => {
    const missingEnd = without(arrow(bound, null), "endBinding");
    expect(isArrowBoundToElement(missingEnd)).toBe(true);
  });

  // CT07 e CT08: seta com cotovelos segue a mesma regra
  it("CT07-CT08: elbow arrows follow the same rule", () => {
    expect(isArrowBoundToElement(arrow(null, null, true))).toBe(false);
    expect(isArrowBoundToElement(arrow(bound, bound, true))).toBe(true);
  });
});
