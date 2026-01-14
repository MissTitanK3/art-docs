import type { MDXComponents } from "nextra/mdx-components";
import { useMDXComponents as useDocsComponents } from "nextra-theme-docs";
// Importing the client component directly avoids `ssr: false` restrictions.
import Mermaid from "./components/Mermaid";
import React from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const docs = useDocsComponents(components);

  type CodeProps = { className?: string; children?: React.ReactNode } & Record<string, unknown>;

  const Code: React.FC<CodeProps> = (props) => {
    const { className, children } = props as { className?: string; children?: React.ReactNode };
    const code = Array.isArray(children) ? children.join("") : String(children ?? "");
    if (typeof className === "string" && className.includes("language-mermaid")) {
      return <Mermaid chart={code} />;
    }
    // Fallback to the original code component from docs theme if available
    const OriginalCode = docs.code as React.ComponentType<Record<string, unknown>> | undefined;
    if (OriginalCode) return <OriginalCode {...props} />;
    return <pre {...props} />;
  };

  return {
    ...docs,
    code: Code,
  };
}
