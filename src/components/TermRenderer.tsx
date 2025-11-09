// Component to render term definition from JSONB
// Simple recursive renderer for TipTap JSON content
import React from 'react';

interface JSONContent {
  type: string;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{ type: string }>;
  attrs?: Record<string, any>;
}

interface TermRendererProps {
  content: JSONContent | string | null;
}

export default function TermRenderer({ content }: TermRendererProps) {
  if (!content) {
    return <p className="text-gray-500">Chưa có nội dung.</p>;
  }

  // If content is a string, try to parse it
  let parsedContent: JSONContent;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // If parsing fails, treat as plain text
      return <div className="prose max-w-none whitespace-pre-wrap">{content}</div>;
    }
  } else {
    parsedContent = content;
  }

  // Recursive render function with stable keys
  const renderNode = (node: JSONContent, path: string = '0'): React.ReactNode => {
    if (!node.type) return null;

    const children = node.content?.map((child, idx) => 
      renderNode(child, `${path}-${idx}`)
    );

    switch (node.type) {
      case 'doc':
        return <div key={path}>{children}</div>;

      case 'paragraph':
        return (
          <p key={path} className="my-2">
            {children || '\u00A0'}
          </p>
        );

      case 'heading':
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={path} className="mt-4 mb-2 font-bold">
            {children}
          </HeadingTag>
        );

      case 'text':
        let text: React.ReactNode = node.text || '';
        if (node.marks && node.marks.length > 0) {
          // Apply marks in reverse order (inner to outer) - create a copy to avoid mutation
          const marksCopy = [...node.marks].reverse();
          marksCopy.forEach((mark) => {
            if (mark.type === 'bold') {
              text = <strong>{text}</strong>;
            } else if (mark.type === 'italic') {
              text = <em>{text}</em>;
            } else if (mark.type === 'strike') {
              text = <s>{text}</s>;
            }
          });
        }
        return <span key={path}>{text}</span>;

      case 'bulletList':
        return (
          <ul key={path} className="my-2 list-disc list-inside">
            {children}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={path} className="my-2 list-decimal list-inside">
            {children}
          </ol>
        );

      case 'listItem':
        return <li key={path}>{children}</li>;

      case 'blockquote':
        return (
          <blockquote
            key={path}
            className="my-2 border-l-4 border-gray-300 pl-4 italic"
          >
            {children}
          </blockquote>
        );

      case 'horizontalRule':
        return <hr key={path} className="my-4" />;

      case 'hardBreak':
        return <br key={path} />;

      default:
        return <div key={path}>{children}</div>;
    }
  };

  return (
    <div className="prose max-w-none">
      {renderNode(parsedContent)}
    </div>
  );
}

