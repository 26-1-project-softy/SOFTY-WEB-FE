import type { ReactNode } from 'react';

type LandingTextLinesProps = {
  lines: string[];
  renderLine?: (line: string, index: number) => ReactNode;
};

export const LandingTextLines = ({ lines, renderLine }: LandingTextLinesProps) => {
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {renderLine ? renderLine(line, index) : line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
};
