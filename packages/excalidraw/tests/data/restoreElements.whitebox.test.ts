import { isArrowElement } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { API } from "../helpers/api";
import { restoreElements } from "../../data/restore";

describe("restoreElements - caixa branca Gabriela", () => {
  const rectangle = (width: number, height: number) => ({
    ...API.createElement({ type: "rectangle", width, height }),
    index: "a0" as ExcalidrawElement["index"],
    version: 3,
  });

  // D1 = deleteInvisibleElements && isInvisiblySmallElement(element).
  // CW01/CW02: influencia da opcao; CW02/CW03: influencia da geometria.
  it("CW01: preserva elemento invisivel quando a exclusao esta desativada", () => {
    const element = rectangle(0, 0);
    const [restored] = restoreElements(
      [element],
      [{ ...element, version: 7 }],
      { deleteInvisibleElements: false },
    );
    expect(restored.isDeleted).toBe(false);
    expect(restored.version).toBe(3);
  });

  it("CW02: exclui elemento invisivel e incrementa a versao local", () => {
    const element = rectangle(0, 0);
    const local = { ...element, version: 7 };
    const [restored] = restoreElements([element], [local], {
      deleteInvisibleElements: true,
    });
    expect(restored.isDeleted).toBe(true);
    expect(restored.version).toBe(8);
  });

  it("CW03: preserva elemento visivel mesmo com exclusao ativada", () => {
    const element = rectangle(20, 20);
    const [restored] = restoreElements(
      [element],
      [{ ...element, version: 7 }],
      { deleteInvisibleElements: true },
    );
    expect(restored.isDeleted).toBe(false);
    expect(restored.version).toBe(3);
  });

  const text = () =>
    API.createElement({
      type: "text",
      text: "Texto de teste",
      width: 9999,
      height: 9999,
    });

  // D2 = refreshDimensions && isTextElement(element), com repairBindings ativo.
  // CW04/CW05: influencia da opcao; CW05/CW06: influencia do tipo.
  it("CW04: preserva dimensoes do texto quando refreshDimensions e false", () => {
    const [restored] = restoreElements([text()], null, {
      repairBindings: true,
      refreshDimensions: false,
    });
    expect([restored.width, restored.height]).toEqual([9999, 9999]);
  });

  it("CW05: recalcula dimensoes do texto quando ambas as opcoes estao ativas", () => {
    const [restored] = restoreElements([text()], null, {
      repairBindings: true,
      refreshDimensions: true,
    });
    expect(restored.width).toBeGreaterThan(0);
    expect(restored.height).toBeGreaterThan(0);
    expect(restored.width).not.toBe(9999);
    expect(restored.height).not.toBe(9999);
  });

  it("CW06: nao recalcula dimensoes de um retangulo", () => {
    const [restored] = restoreElements([rectangle(9999, 9999)], null, {
      repairBindings: true,
      refreshDimensions: true,
    });
    expect([restored.width, restored.height]).toEqual([9999, 9999]);
  });

  it("CW07: retorno antecipado impede atualizacao mesmo com refreshDimensions ativo", () => {
    const [restored] = restoreElements([text()], null, {
      repairBindings: false,
      refreshDimensions: true,
    });
    expect([restored.width, restored.height]).toEqual([9999, 9999]);
  });

  it("CW08: retorno antecipado preserva referencia a frame ausente", () => {
    const element = { ...rectangle(20, 20), frameId: "frame-ausente" };
    const [restored] = restoreElements([element], null, {
      repairBindings: false,
    });
    expect(restored.frameId).toBe("frame-ausente");
  });

  it("CW09: reparo remove referencia a frame ausente", () => {
    const element = { ...rectangle(20, 20), frameId: "frame-ausente" };
    const [restored] = restoreElements([element], null, {
      repairBindings: true,
    });
    expect(restored.frameId).toBeNull();
  });

  it("CW10: ids repetidos percorrem o ramo que gera um novo identificador", () => {
    const first = { ...rectangle(20, 20), id: "repetido" };
    const second = { ...rectangle(30, 30), id: "repetido" };
    const restored = restoreElements([first, second], null);
    expect(restored).toHaveLength(2);
    expect(restored[0].id).toBe("repetido");
    expect(restored[1].id).not.toBe("repetido");
    expect(new Set(restored.map((element) => element.id)).size).toBe(2);
  });

  const binding = (elementId: string) => ({
    elementId,
    mode: "orbit" as const,
    fixedPoint: [0.5, 0.5] as [number, number],
  });

  it("CW11: reparo remove vinculos inicial e final com alvos ausentes", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding: binding("inicio-ausente"),
      endBinding: binding("fim-ausente"),
    });
    const restored = restoreElements([arrow], null, {
      repairBindings: true,
    }).find(isArrowElement);
    expect(restored).toBeDefined();
    expect(restored?.startBinding).toBeNull();
    expect(restored?.endBinding).toBeNull();
  });

  it("CW12: reparo preserva vinculos com alvo existente", () => {
    const target = { ...rectangle(100, 100), id: "alvo" };
    const arrow = API.createElement({
      type: "arrow",
      startBinding: binding("alvo"),
      endBinding: binding("alvo"),
    });
    const restored = restoreElements<ExcalidrawElement>([target, arrow], null, {
      repairBindings: true,
    });
    const restoredArrow = restored.find(isArrowElement);
    expect(restoredArrow).toBeDefined();
    expect(restoredArrow?.startBinding?.elementId).toBe("alvo");
    expect(restoredArrow?.endBinding?.elementId).toBe("alvo");
  });

  it("CW13: seta sem vinculos percorre os ramos falsos do reparo", () => {
    const arrow = API.createElement({ type: "arrow" });
    const restored = restoreElements([arrow], null, {
      repairBindings: true,
    }).find(isArrowElement);
    expect(restored).toBeDefined();
    expect(restored?.startBinding).toBeNull();
    expect(restored?.endBinding).toBeNull();
  });

  it("CW14: retorno antecipado preserva vinculo com alvo ausente", () => {
    const arrow = API.createElement({
      type: "arrow",
      startBinding: binding("inicio-ausente"),
      endBinding: binding("fim-ausente"),
    });
    const restored = restoreElements([arrow], null, {
      repairBindings: false,
    }).find(isArrowElement);
    expect(restored).toBeDefined();
    expect(restored?.startBinding?.elementId).toBe("inicio-ausente");
    expect(restored?.endBinding?.elementId).toBe("fim-ausente");
  });
});
