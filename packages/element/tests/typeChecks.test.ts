import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import { newElementWith } from "../src/mutateElement";
import {
  hasBoundTextElement,
  isLinearElement,
  isTextElement,
} from "../src/typeChecks";

import type {
  ExcalidrawElement,
  ExcalidrawLinearElement,
  ExcalidrawTextElement,
  NonDeleted,
  NonDeletedExcalidrawElement,
} from "../src/types";

describe("Test TypeChecks", () => {
  describe("Test hasBoundTextElement", () => {
    it("should return true for text bindable containers with bound text", () => {
      expect(
        hasBoundTextElement(
          API.createElement({
            type: "rectangle",
            boundElements: [{ type: "text", id: "text-id" }],
          }),
        ),
      ).toBeTruthy();

      expect(
        hasBoundTextElement(
          API.createElement({
            type: "ellipse",
            boundElements: [{ type: "text", id: "text-id" }],
          }),
        ),
      ).toBeTruthy();

      expect(
        hasBoundTextElement(
          API.createElement({
            type: "arrow",
            boundElements: [{ type: "text", id: "text-id" }],
          }),
        ),
      ).toBeTruthy();
    });

    it("should return false for text bindable containers without bound text", () => {
      expect(
        hasBoundTextElement(
          API.createElement({
            type: "freedraw",
            boundElements: [{ type: "arrow", id: "arrow-id" }],
          }),
        ),
      ).toBeFalsy();
    });

    it("should return false for non text bindable containers", () => {
      expect(
        hasBoundTextElement(
          API.createElement({
            type: "freedraw",
            boundElements: [{ type: "text", id: "text-id" }],
          }),
        ),
      ).toBeFalsy();
    });

    expect(
      hasBoundTextElement(
        API.createElement({
          type: "image",
          boundElements: [{ type: "text", id: "text-id" }],
        }),
      ),
    ).toBeFalsy();
  });
//-------CASOS DE TESTE CAIXA BRANCA-----
//testar arrow e line, eles tem que passar
describe("Test isLinearElement", () => {
    it("should return true for arrow element", () => {
      const arrow = API.createElement({ type: "arrow" });
      expect(isLinearElement(arrow)).toBe(true);
    });

    it("should return true for line element", () => {
      const line = API.createElement({ type: "line" });
      expect(isLinearElement(line)).toBe(true);
    });

       //testar retangulo e freedraw, eles nao podem passar
    it("should return false for non-linear elements", () => {
      const rectangle = API.createElement({ type: "rectangle" });
      const freedraw = API.createElement({ type: "freedraw" });

      expect(isLinearElement(rectangle)).toBe(false);
      expect(isLinearElement(freedraw)).toBe(false);
    });

      //testar null e undefined, eles nao podem passar
    it("should return false when element is null or undefined", () => {
      expect(isLinearElement(null)).toBe(false);
      expect(isLinearElement(undefined)).toBe(false);
    });
  });

});

//----------CASOS DE TESTE CAIXA PRETA------------
describe("isLinearElement - caixa-preta", () => {
  // CT01: arrow pertence à classe linear e deve retornar true
  it("should return true for arrow elements", () => {
    const element = API.createElement({ type: "arrow" });
    expect(isLinearElement(element)).toBe(true);
  });

  // CT02: line pertence à classe linear e deve retornar true
  it("should return true for line elements", () => {
    const element = API.createElement({ type: "line" });
    expect(isLinearElement(element)).toBe(true);
  });
  
  // CT03-CT06: estes tipos válidos devem retornar false.
  it("should return false for non-linear element types", () => {
    const elements = [
      API.createElement({ type: "rectangle" }),
      API.createElement({ type: "ellipse" }),
      API.createElement({ type: "text", text: "text" }),
      API.createElement({ type: "freedraw" }),
    ];

    for (const element of elements) {
      expect(isLinearElement(element)).toBe(false);
    }
  });

});


describe("Test NonDeleted type", () => {
  it("should only allow `isDeleted: false` elements", () => {
    const element = API.createElement({ type: "rectangle" });
    const deletedElement = newElementWith(element as ExcalidrawElement, {
      isDeleted: true,
    });

    // @ts-expect-error deleted elements are not assignable to NonDeleted
    const nonDeleted: NonDeletedExcalidrawElement = deletedElement;

    // runtime narrowing is still required to treat an element as non-deleted
    // @ts-expect-error generic elements are not assignable to NonDeleted
    const nonDeletedGeneric: NonDeletedExcalidrawElement =
      deletedElement as ExcalidrawElement;

    expect(nonDeleted.isDeleted).toBe(true);
    expect(nonDeletedGeneric.isDeleted).toBe(true);
  });

  it("should be preserved by type guards", () => {
    const elements: NonDeletedExcalidrawElement[] = [
      API.createElement({ type: "text", text: "text" }),
      API.createElement({ type: "arrow" }),
    ];

    const textElements: NonDeleted<ExcalidrawTextElement>[] =
      elements.filter(isTextElement);
    const linearElements: NonDeleted<ExcalidrawLinearElement>[] =
      elements.filter(isLinearElement);

    expect(textElements.length).toBe(1);
    expect(linearElements.length).toBe(1);
  });
});
