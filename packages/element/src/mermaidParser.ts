const validateMermaidInput = (input: string) => {
  if (!input || input.trim() === "") {
    throw new Error("Input do Mermaid não pode estar vazio");
  }
};

export const parseMermaidToExcalidraw = (input: string) => {
  validateMermaidInput(input);
};
