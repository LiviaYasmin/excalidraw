import { describe, expect, it } from "vitest";

import { parseMermaidToExcalidraw } from "../src/mermaidParser";

describe("parseMermaidToExcalidraw - TDD", () => {
  describe("Ciclo 1: Tratamento de Input Vazio ou Nulo", () => {
    it("deve lançar um erro quando o input do Mermaid for vazio", () => {
      expect(() => parseMermaidToExcalidraw("")).toThrow(
        "Input do Mermaid não pode estar vazio",
      );
    });
  });

  describe("Ciclo 2: Nós Sem Rótulo (Label)", () => {
    it("deve atribuir um rótulo padrão quando o nó Mermaid não possuir texto", () => {
      const result = parseMermaidToExcalidraw("graph TD; A[];");
      expect(result.elements[0].text).toBe("Sem nome");
    });
  });

  describe("Ciclo 3: Tratamento de Espaçamentos Anômalos", () => {
    it("deve processar corretamente relações com excesso de espaços", () => {
      const result = parseMermaidToExcalidraw("graph TD; A    -->     B;");
      expect(result.edges.length).toBe(1);
      expect(result.edges[0].source).toBe("A");
    });
  });

  describe("Ciclo 4: Caracteres Não Suportados (Emojis/Símbolos)", () => {
    it("deve remover caracteres não suportados/inválidos da string do Mermaid", () => {
      const result = parseMermaidToExcalidraw("graph TD; A --> B 🛑;");
      expect(result.elements[1].text).not.toContain("🛑");
    });
  });

  describe("Ciclo 5: Arestas Malformadas", () => {
    it("deve ignorar arestas cujo destino não é um nó válido", () => {
      const result = parseMermaidToExcalidraw("graph TD; A --> ?!;");
      expect(result.edges).toHaveLength(0);
      expect(result.elements.map((e) => e.id)).toEqual(["A"]);
    });
  });

  describe("Ciclo 6: Bloqueio de Self-loops", () => {
    it("deve ignorar relações de self-loop (nó apontando para si mesmo)", () => {
      const result = parseMermaidToExcalidraw("graph TD; A --> A;");
      expect(result.edges).toHaveLength(0);
      expect(result.elements.map((e) => e.id)).toEqual(["A"]);
    });
  });
});