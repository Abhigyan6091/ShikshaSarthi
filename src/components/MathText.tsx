import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// Splits text on $$...$$ (block) and $...$ (inline) LaTeX delimiters and
// renders each segment with KaTeX, leaving plain text untouched.
const MATH_SPLIT_REGEX = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;

const renderSegment = (segment: string, key: number) => {
  if (segment.startsWith("$$") && segment.endsWith("$$")) {
    const expr = segment.slice(2, -2).trim();
    if (!expr) return null;
    try {
      return <BlockMath key={key} math={expr} errorColor="#dc2626" />;
    } catch {
      return <span key={key}>{segment}</span>;
    }
  }
  if (segment.startsWith("$") && segment.endsWith("$")) {
    const expr = segment.slice(1, -1).trim();
    if (!expr) return null;
    try {
      return <InlineMath key={key} math={expr} errorColor="#dc2626" />;
    } catch {
      return <span key={key}>{segment}</span>;
    }
  }
  return <React.Fragment key={key}>{segment}</React.Fragment>;
};

interface MathTextProps {
  text?: string | null;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Renders text that may contain inline ($...$) or block ($$...$$) LaTeX
// alongside plain (including Hindi) text.
export const MathText: React.FC<MathTextProps> = ({ text, className, as = "span" }) => {
  const Tag = as as React.ElementType;
  if (!text) return null;

  const segments = text.split(MATH_SPLIT_REGEX).filter((s) => s !== "");
  if (segments.length === 1 && !MATH_SPLIT_REGEX.test(segments[0])) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {segments.map((segment, i) => renderSegment(segment, i))}
    </Tag>
  );
};

interface QuestionMediaProps {
  imageUrl?: string | null;
  altText?: string;
  className?: string;
}

// Renders an optional question image/diagram/plot beneath question text.
export const QuestionMedia: React.FC<QuestionMediaProps> = ({ imageUrl, altText, className }) => {
  if (!imageUrl || !imageUrl.trim()) return null;
  return (
    <div className={className ?? "my-3 flex justify-center"}>
      <img
        src={imageUrl}
        alt={altText || "Question diagram"}
        className="max-h-80 max-w-full rounded-lg border border-slate-200 object-contain"
        loading="lazy"
      />
    </div>
  );
};

export default MathText;
