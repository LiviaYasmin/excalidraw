import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import { isArrowBoundToElement } from "../src/typeChecks";

import type { ExcalidrawArrowElement, FixedPointBinding } from "../src/types";

describe("isArrowBoundToElement - MC/DC", () => {
  const startBinding: FixedPointBinding = {
    elementId: "start-target",
    fixedPoint: [0.5, 0.5],
    mode: "orbit",
  };
  const endBinding: FixedPointBinding = {
    elementId: "end-target",
    fixedPoint: [0.5, 0.5],
    mode: "orbit",
  };

  it("T1: returns false when neither endpoint is bound", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding: null,
      endBinding: null,
    }) as ExcalidrawArrowElement;

    expect(isArrowBoundToElement(arrow)).toBe(false);
  });

  // T1/T2: only A changes, and the decision changes (B is false).
  it("T2: returns true when only the start is bound", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding,
      endBinding: null,
    }) as ExcalidrawArrowElement;

    expect(isArrowBoundToElement(arrow)).toBe(true);
  });

  // T1/T3: only B changes, and the decision changes (A is false).
  it("T3: returns true when only the end is bound", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding: null,
      endBinding,
    }) as ExcalidrawArrowElement;

    expect(isArrowBoundToElement(arrow)).toBe(true);
  });

  it("T4: returns true when both endpoints are bound", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding,
      endBinding,
    }) as ExcalidrawArrowElement;

    expect(isArrowBoundToElement(arrow)).toBe(true);
  });
});
