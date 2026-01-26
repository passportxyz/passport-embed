"use client";

import { Tabs } from "@/components/ui/Tabs";
import { CodeGenerator } from "./CodeGenerator";
import { PlaygroundConfig } from "@/lib/default-config";
import {
  generateReactCode,
  generateNextJsCode,
  generateInstallCode,
  generateEnvCode,
} from "@/lib/code-templates";

interface CodePanelProps {
  config: PlaygroundConfig;
}

export function CodePanel({ config }: CodePanelProps) {
  const tabs = [
    {
      id: "react",
      label: "React",
      group: "code",
      content: <CodeGenerator code={generateReactCode(config)} language="tsx" />,
    },
    {
      id: "nextjs",
      label: "Next.js",
      group: "code",
      content: <CodeGenerator code={generateNextJsCode(config)} language="tsx" />,
    },
    {
      id: "install",
      label: "Install",
      group: "setup",
      content: <CodeGenerator code={generateInstallCode()} language="bash" />,
    },
    {
      id: "env",
      label: ".env",
      group: "setup",
      content: <CodeGenerator code={generateEnvCode(config)} language="bash" />,
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Code Output</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs tabs={tabs} defaultTab="react" />
      </div>
    </div>
  );
}
