/*
 * Gera os arquivos de carga dos testes de desempenho do Excalidraw.
 *
 * Uso:   node gerar-cargas.js [pasta-de-saida]
 * Saída: carga-100.excalidraw, carga-1000.excalidraw, carga-5000.excalidraw
 *
 * Cada arquivo tem apenas retângulos 100x60 px, preenchimento transparente,
 * em grade de 100 colunas (espaçamento 140x100 px). Os valores são fixos
 * (inclusive seed e timestamps), então os arquivos são idênticos a cada geração.
 */
const fs = require("fs");
const path = require("path");

const saida = process.argv[2] || ".";
fs.mkdirSync(saida, { recursive: true });

const quantidades = [100, 1000, 5000];
const COLUNAS = 100;
const TIMESTAMP_FIXO = 1700000000000; // fixo para o arquivo ser determinístico

for (const quantidade of quantidades) {
  const elementos = Array.from({ length: quantidade }, (_, i) => ({
    id: `elemento-${quantidade}-${i + 1}`,
    type: "rectangle",
    x: (i % COLUNAS) * 140,
    y: Math.floor(i / COLUNAS) * 100,
    width: 100,
    height: 60,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: i + 1,
    version: 1,
    versionNonce: i + 1,
    isDeleted: false,
    boundElements: null,
    updated: TIMESTAMP_FIXO,
    link: null,
    locked: false,
  }));

  const arquivo = {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: elementos,
    appState: { gridSize: 20, viewBackgroundColor: "#ffffff" },
    files: {},
  };

  const destino = path.join(saida, `carga-${quantidade}.excalidraw`);
  fs.writeFileSync(destino, JSON.stringify(arquivo, null, 2));
  console.log(`Arquivo criado: ${destino}`);
}
