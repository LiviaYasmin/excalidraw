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
});
