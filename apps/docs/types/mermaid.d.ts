declare module 'mermaid' {
  export interface MermaidAPI {
    initialize(config: Record<string, unknown>): void;
    render(id: string, code: string): Promise<{ svg: string }>;
  }

  const mermaid: MermaidAPI | { default: MermaidAPI };
  export default mermaid;
}
