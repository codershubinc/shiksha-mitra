import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Pre-process LaTeX inline math like $2x^2$ or $$equation$$ so it renders crisply in markdown
  const formattedContent = content
    .replace(/\$\$([\s\S]*?)\$\$/g, '\n```math\n$1\n```\n')
    .replace(/\$([^\$\n]+)\$/g, '`$1`');

  return (
    <div className={`markdown-content text-slate-100 text-xs md:text-sm space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="leading-relaxed mb-2 last:mb-0">{children}</p>;
          },
          strong({ children }) {
            return <strong className="font-bold text-amber-300">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-teal-200/90">{children}</em>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 space-y-1.5 my-2 text-slate-200">{children}</ul>;
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 space-y-1.5 my-2 text-slate-200">{children}</ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed pl-1">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-amber-500/60 pl-3.5 py-1 my-2 bg-amber-500/10 rounded-r-xl text-amber-100 italic text-xs">
                {children}
              </blockquote>
            );
          },
          code({ className, children, ...props }) {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <div className="my-2 p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-amber-300 overflow-x-auto">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] md:text-xs font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return (
              <h1 className="font-headline text-base md:text-lg font-bold text-white mt-3 mb-1">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="font-headline text-sm md:text-base font-bold text-amber-300 mt-2.5 mb-1">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="font-headline text-xs md:text-sm font-bold text-teal-300 mt-2 mb-0.5">
                {children}
              </h3>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
