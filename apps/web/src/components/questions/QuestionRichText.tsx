import type { ReactNode } from "react";

export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={match.index} className="font-bold text-[color:var(--text-strong)]">
          {match[2]}
        </strong>,
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={match.index}
          className="rounded bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-[13px] font-medium text-[color:var(--accent-strong)]"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

interface CodeBlock {
  type: "code";
  language: string;
  code: string;
}

interface TextBlock {
  type: "text";
  content: string;
}

type Block = CodeBlock | TextBlock;

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const codeBlockPattern = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }

    blocks.push({ type: "code", language: match[1] || "text", code: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: "text", content: content.slice(lastIndex) });
  }

  return blocks;
}

function splitSections(text: string): string[] {
  const sections: string[] = [];
  const raw = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  for (const paragraph of raw) {
    const headingMatch = paragraph.match(/^(#{1,6})\s+.+/);
    if (headingMatch) {
      const firstNewline = paragraph.indexOf("\n");
      if (firstNewline !== -1) {
        sections.push(paragraph.slice(0, firstNewline).trim());
        const rest = paragraph.slice(firstNewline + 1).trim();
        if (rest) sections.push(rest);
      } else {
        sections.push(paragraph);
      }
    } else {
      sections.push(paragraph);
    }
  }

  return sections;
}

function renderTextBlock(text: string, blockIndex: number) {
  const paragraphs = splitSections(text);

  return paragraphs.map((paragraph, paragraphIndex) => {
    const headingMatch = paragraph.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const className =
        level <= 2
          ? "font-display text-lg font-bold text-[color:var(--text-strong)]"
          : "font-display text-base font-semibold text-[color:var(--text-strong)]";
      return (
        <h3 key={`${blockIndex}-${paragraphIndex}`} className={className}>
          {renderInlineMarkdown(headingText)}
        </h3>
      );
    }

    const lines = paragraph.split("\n").map((line) => line.trim());
    const isList = lines.every((line) => line.startsWith("- ") || line.startsWith("* "));

    if (isList) {
      return (
        <ul key={`${blockIndex}-${paragraphIndex}`} className="space-y-2 pl-5">
          {lines.map((line, lineIndex) => (
            <li key={`${blockIndex}-${paragraphIndex}-${lineIndex}`} className="list-disc">
              {renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`${blockIndex}-${paragraphIndex}`}>
        {renderInlineMarkdown(paragraph)}
      </p>
    );
  });
}

export function QuestionRichText({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-[15px] leading-7 text-[color:var(--text-soft)]">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div
              key={`code-${index}`}
              className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--code-bg)]"
            >
              <div className="flex items-center border-b border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-[color:var(--code-soft)]">
                {block.language}
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-6 text-[color:var(--code-text)]">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        return renderTextBlock(block.content, index);
      })}
    </div>
  );
}
