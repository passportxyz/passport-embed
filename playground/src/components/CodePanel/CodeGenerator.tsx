"use client";

import { Highlight, themes } from "prism-react-renderer";
import { CopyButton } from "./CopyButton";

interface CodeGeneratorProps {
  code: string;
  language: string;
}

export function CodeGenerator({ code, language }: CodeGeneratorProps) {
  return (
    <div className="h-full flex flex-col">
      <div
        className="flex justify-end p-2 border-b"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <CopyButton text={code} />
      </div>
      <div className="flex-1 overflow-auto">
        <Highlight theme={themes.nightOwl} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={className}
              style={{
                ...style,
                margin: 0,
                padding: "16px",
                fontSize: "13px",
                lineHeight: "1.6",
                fontFamily: "var(--font-fira-code), 'Fira Code', 'Consolas', monospace",
                minHeight: "100%",
                backgroundColor: '#0d1117',
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span
                    className="inline-block w-8 select-none text-right mr-4"
                    style={{ color: '#6e7681' }}
                  >
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
