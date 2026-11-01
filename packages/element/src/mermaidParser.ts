export interface MermaidElement {
  id: string;
  text: string;
}

export interface MermaidEdge {
  source: string;
  target: string;
}

export interface MermaidResult {
  elements: MermaidElement[];
  edges: MermaidEdge[];
}

const DEFAULT_NODE_LABEL = "Sem nome";

const validateMermaidInput = (input: string) => {
  if (!input || input.trim() === "") {
    throw new Error("Input do Mermaid não pode estar vazio");
  }
};

const extractNodes = (input: string): MermaidElement[] => {
  const elements: MermaidElement[] = [];
  const nodeRegex = /([A-Za-z0-9_]+)\s*\[(.*?)\]/g;
  let match;
  while ((match = nodeRegex.exec(input)) !== null) {
    const id = match[1];
    const rawLabel = match[2].trim();
    const text = rawLabel || DEFAULT_NODE_LABEL;
    elements.push({ id, text });
  }
  return elements;
};

export const parseMermaidToExcalidraw = (input: string): MermaidResult => {
  validateMermaidInput(input);

  const elements = extractNodes(input);

  return {
    elements,
    edges: [],
  };
};
