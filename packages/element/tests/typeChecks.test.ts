import { pointFrom, PRECISION, type LocalPoint } from "@excalidraw/math";

import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import { newElementWith } from "../src/mutateElement";
import {
  hasBoundTextElement,
  isLinearElement,
  isPolygonElement,
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

    //-----------NOVA FUNCAO POLYGON--------------
    describe("TDD", () => {
      //TESTE 1
      it("Ciclo 1: true para um elemento linear que seja um poligono fechado", () => {
        const polygonLine = API.createElement({
          type: "line",
          polygon: true,
          points: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 0],
          ] as any,
        });
        expect(isPolygonElement(polygonLine)).toBe(true);
      });

      //TESTE 2
      it("Ciclo 2: false quando o elemento linear for um polygon false", () => {
        const regularLine = API.createElement({
          type: "line",
          polygon: false,
          points: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 0],
          ] as any,
        });
        expect(isPolygonElement(regularLine)).toBe(false);
      });
    });

    // TESTE 3
    it("Ciclo 3: should return false when element is null or undefined", () => {
      expect(isPolygonElement(null)).toBe(false);
      expect(isPolygonElement(undefined)).toBe(false);
    });

    // TESTE 4
    it("Ciclo 4: should return false for non-line elements even if polygon property is present", () => {
      const rectangle = {
        ...API.createElement({ type: "rectangle" }),
        polygon: true,
      } as any;
      const arrow = API.createElement({ type: "arrow" });

      expect(isPolygonElement(rectangle)).toBe(false);
      expect(isPolygonElement(arrow)).toBe(false);
    });
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

describe("isPolygonElement - TDD Gabriela", () => {
  it("Ciclo 5: rejeita linhas com polygon true e menos de quatro pontos", () => {
    const pointSets: LocalPoint[][] = [
      [],
      [pointFrom<LocalPoint>(0, 0)],
      [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(10, 10)],
      [
        pointFrom<LocalPoint>(0, 0),
        pointFrom<LocalPoint>(10, 0),
        pointFrom<LocalPoint>(0, 0),
      ],
    ];

    for (const points of pointSets) {
      const line = API.createElement({
        type: "line",
        polygon: true,
        points,
      });

      expect(isPolygonElement(line)).toBe(false);
    }
  });

  it("Ciclo 6: verifica o fechamento dos pontos com a tolerancia do projeto", () => {
    const openEndPoints: LocalPoint[] = [
      pointFrom<LocalPoint>(20, 20),
      pointFrom<LocalPoint>(10, 0),
      pointFrom<LocalPoint>(0, 10),
      pointFrom<LocalPoint>(PRECISION, 0),
    ];

    for (const endPoint of openEndPoints) {
      const line = API.createElement({
        type: "line",
        polygon: true,
        points: [
          pointFrom<LocalPoint>(0, 0),
          pointFrom<LocalPoint>(10, 0),
          pointFrom<LocalPoint>(10, 10),
          endPoint,
        ],
      });

      expect(isPolygonElement(line)).toBe(false);
    }

    const nearlyClosedLine = API.createElement({
      type: "line",
      polygon: true,
      points: [
        pointFrom<LocalPoint>(0, 0),
        pointFrom<LocalPoint>(10, 0),
        pointFrom<LocalPoint>(10, 10),
        pointFrom<LocalPoint>(PRECISION / 2, PRECISION / 2),
      ],
    });

    expect(isPolygonElement(nearlyClosedLine)).toBe(true);
  });
});
