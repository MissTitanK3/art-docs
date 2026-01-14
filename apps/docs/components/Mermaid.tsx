"use client";
import React, { useEffect, useRef, useState } from "react";
import type { MermaidAPI } from "mermaid";

type Props = { chart: string };

export default function Mermaid({ chart }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let mermaidInstance: MermaidAPI | undefined;

    async function render() {
      try {
        const mermaidModule = (await import("mermaid")) as unknown;
        const mermaidLib = ((mermaidModule as { default?: MermaidAPI }).default ?? (mermaidModule as MermaidAPI)) as MermaidAPI;
        mermaidLib.initialize({ startOnLoad: false });
        mermaidInstance = mermaidLib;

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        if (!ref.current) return;
        const { svg } = await mermaidInstance.render(id, chart);
        if (mounted && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e: unknown) {
        console.error("Mermaid render error:", e);
        if (mounted) {
          if (e instanceof Error) setError(e.message);
          else setError(String(e));
        }
      }
    }

    render();

    return () => {
      mounted = false;
    };
  }, [chart]);

  if (error) return <pre style={{ color: "var(--nx-red)" }}>{error}</pre>;
  return <div ref={ref} className="nextra-mermaid" />;
}
