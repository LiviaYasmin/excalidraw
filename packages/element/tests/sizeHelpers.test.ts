import { vi } from "vitest";

import { pointFrom, type LocalPoint } from "@excalidraw/math";

import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import {
  getPerfectElementSize,
  INVISIBLY_SMALL_ELEMENT_SIZE,
  isInvisiblySmallElement,
} from "../src/sizeHelpers";

import type {
  ExcalidrawArrowElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawLineElement,
  ExcalidrawRectangleElement,
} from "../src/types";

const EPSILON_DIGITS = 3;
// Needed so that we can mock the value of constants which is done in
// below tests. In Jest this wasn't needed as global override was possible
// but vite doesn't allow that hence we need to mock
vi.mock(
  "@excalidraw/common",
  //@ts-ignore
  async (importOriginal) => {
    const module: any = await importOriginal();
    return { ...module };
  },
);
describe("getPerfectElementSize", () => {
  it("should return height:0 if `elementType` is line and locked angle is 0", () => {
    const { height, width } = getPerfectElementSize("line", 149, 10);
    expect(width).toBeCloseTo(149, EPSILON_DIGITS);
    expect(height).toBeCloseTo(0, EPSILON_DIGITS);
  });

  it("should return width:0 if `elementType` is line and locked angle is 90 deg (Math.PI/2)", () => {
    const { height, width } = getPerfectElementSize("line", 10, 140);
    expect(width).toBeCloseTo(0, EPSILON_DIGITS);
    expect(height).toBeCloseTo(140, EPSILON_DIGITS);
  });

  it("should return height:0 if `elementType` is arrow and locked angle is 0", () => {
    const { height, width } = getPerfectElementSize("arrow", 200, 20);
    expect(width).toBeCloseTo(200, EPSILON_DIGITS);
    expect(height).toBeCloseTo(0, EPSILON_DIGITS);
  });
  it("should return width:0 if `elementType` is arrow and locked angle is 90 deg (Math.PI/2)", () => {
    const { height, width } = getPerfectElementSize("arrow", 10, 100);
    expect(width).toBeCloseTo(0, EPSILON_DIGITS);
    expect(height).toBeCloseTo(100, EPSILON_DIGITS);
  });

  it("should return adjust height to be width * tan(locked angle)", () => {
    const { height, width } = getPerfectElementSize("arrow", 120, 185);
    expect(width).toBeCloseTo(120, EPSILON_DIGITS);
    expect(height).toBeCloseTo(207.846, EPSILON_DIGITS);
  });

  it("should return height equals to width if locked angle is 45 deg", () => {
    const { height, width } = getPerfectElementSize("arrow", 135, 145);
    expect(width).toBeCloseTo(135, EPSILON_DIGITS);
    expect(height).toBeCloseTo(135, EPSILON_DIGITS);
  });

  it("should return height:0 and width:0 when width and height are 0", () => {
    const { height, width } = getPerfectElementSize("arrow", 0, 0);
    expect(width).toBeCloseTo(0, EPSILON_DIGITS);
    expect(height).toBeCloseTo(0, EPSILON_DIGITS);
  });
});

describe("isInvisiblySmallElement - Caixa-Branca (MC/DC)", () => {
  describe("Decisões D1 e D2: Elementos lineares e freedraw", () => {
    it("CT01: deve retornar true para elemento linear com menos de 2 pontos (D2: A=V)", () => {
      const line = API.createElement({
        type: "line",
        points: [pointFrom<LocalPoint>(0, 0)],
      }) as ExcalidrawLineElement;

      expect(isInvisiblySmallElement(line)).toBe(true);
    });

    it("CT02: deve retornar true para seta com 2 pontos cuja distância é menor que o limiar (D2: B=V, C=V, D=V)", () => {
      const arrow = API.createElement({
        type: "arrow",
        points: [
          pointFrom<LocalPoint>(0, 0),
          pointFrom<LocalPoint>(INVISIBLY_SMALL_ELEMENT_SIZE / 2, 0),
        ],
      }) as ExcalidrawArrowElement;

      expect(isInvisiblySmallElement(arrow)).toBe(true);
    });

    it("CT03: deve retornar false para seta com 2 pontos distantes (D2: B=V, C=V, D=F)", () => {
      const arrow = API.createElement({
        type: "arrow",
        points: [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(10, 10)],
      }) as ExcalidrawArrowElement;

      expect(isInvisiblySmallElement(arrow)).toBe(false);
    });

    it("CT04: deve retornar false para linha com 2 pontos coincidentes (D2: B=V, C=F, D=V)", () => {
      const line = API.createElement({
        type: "line",
        points: [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(0, 0)],
      }) as ExcalidrawLineElement;

      expect(isInvisiblySmallElement(line)).toBe(false);
    });

    it("CT05: deve retornar false para seta com 3 ou mais pontos mesmo coincidentes (D2: B=F)", () => {
      const arrow = API.createElement({
        type: "arrow",
        points: [
          pointFrom<LocalPoint>(0, 0),
          pointFrom<LocalPoint>(0, 0),
          pointFrom<LocalPoint>(0, 0),
        ],
      }) as ExcalidrawArrowElement;

      expect(isInvisiblySmallElement(arrow)).toBe(false);
    });

    it("CT06: deve exercitar o desvio de freedraw com pontos válidos (D1: C1=F, C2=V)", () => {
      const freedraw = API.createElement({
        type: "freedraw",
        points: [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(15, 15)],
      }) as ExcalidrawFreeDrawElement;

      expect(isInvisiblySmallElement(freedraw)).toBe(false);
    });
  });

  describe("Decisões D1 e D3: Formas bidimensionais (width e height)", () => {
    it("CT07: deve retornar true quando largura e altura forem 0 (D3: E1=V, E2=V)", () => {
      const rect = API.createElement({
        type: "rectangle",
        width: 0,
        height: 0,
      }) as ExcalidrawRectangleElement;

      expect(isInvisiblySmallElement(rect)).toBe(true);
    });

    it("CT08: deve retornar false quando largura é 0 mas altura é maior que 0 (D3: E1=V, E2=F)", () => {
      const rect = API.createElement({
        type: "rectangle",
        width: 0,
        height: 20,
      }) as ExcalidrawRectangleElement;

      expect(isInvisiblySmallElement(rect)).toBe(false);
    });

    it("CT09: deve retornar false quando largura é maior que 0 mas altura é 0 (D3: E1=F, E2=V)", () => {
      const rect = API.createElement({
        type: "rectangle",
        width: 20,
        height: 0,
      }) as ExcalidrawRectangleElement;

      expect(isInvisiblySmallElement(rect)).toBe(false);
    });

    it("CT10: deve retornar false quando largura e altura forem maiores que 0 (D3: E1=F, E2=F)", () => {
      const rect = API.createElement({
        type: "rectangle",
        width: 50,
        height: 50,
      }) as ExcalidrawRectangleElement;

      expect(isInvisiblySmallElement(rect)).toBe(false);
    });
  });
});
