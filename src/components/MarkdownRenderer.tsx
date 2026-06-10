import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphen
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .trim();
};

const getChildrenText = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getChildrenText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return getChildrenText((children as React.ReactElement).props.children);
  }
  return "";
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-reader">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const text = getChildrenText(children);
            const id = slugify(text);
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children }) => {
            const text = getChildrenText(children);
            const id = slugify(text);
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const text = getChildrenText(children);
            const id = slugify(text);
            return <h3 id={id}>{children}</h3>;
          },
          h4: ({ children }) => {
            const text = getChildrenText(children);
            const id = slugify(text);
            return <h4 id={id}>{children}</h4>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
