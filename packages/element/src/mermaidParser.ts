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

// identificador de nó aceito: letras, números e sublinhado
const NODE_ID_REGEX = /^[A-Za-z0-9_]+$/;

const isValidNodeId = (id: string): boolean => NODE_ID_REGEX.test(id);

// uma aresta só é válida se as duas pontas forem nós existentes
const isValidEdge = (
  source: string,
  target: string,
  nodes: Set<string>,
): boolean => {
  if (source === target) {
    return false;
  }
  return nodes.has(source) && nodes.has(target);
};

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

  const statements = input
    .split(";")
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 && !s.startsWith("graph") && !s.startsWith("flowchart"),
    );

  for (const statement of statements) {
    if (statement.includes("-->")) {
      const parts = statement.split("-->").map((s) => s.trim());
      for (const part of parts) {
        if (isValidNodeId(part) && !elements.some((e) => e.id === part)) {
          elements.push({ id: part, text: part });
        }
      }
    }
  }

  return elements;
};

const extractEdges = (
  input: string,
  elements: MermaidElement[],
): MermaidEdge[] => {
  const nodes = new Set(elements.map((e) => e.id));
  const edges: MermaidEdge[] = [];
  const statements = input
    .split(";")
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 && !s.startsWith("graph") && !s.startsWith("flowchart"),
    );

  for (const statement of statements) {
    if (statement.includes("-->")) {
      const [source, target] = statement.split(" --> ");
      if (isValidEdge(source, target, nodes)) {
        edges.push({ source, target });
      }
    }
  }

  return edges;
};

const sanitizeMermaidString = (rawInput: string): string => {
  // Remove emojis e caracteres especiais não essenciais ao diagrama
  const noEmojis = rawInput.replace(/[\u{1F600}-\u{1F6FF}]/gu, "");
  return noEmojis.replace(/\s+/g, " ").trim();
};

export const parseMermaidToExcalidraw = (input: string): MermaidResult => {
  validateMermaidInput(input);
  const cleanInput = sanitizeMermaidString(input);

  const elements = extractNodes(cleanInput);
  const edges = extractEdges(cleanInput, elements);

  return {
    elements,
    edges,
  };
};