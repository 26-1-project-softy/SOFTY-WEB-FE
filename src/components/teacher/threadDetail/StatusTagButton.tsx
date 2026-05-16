import styled from '@emotion/styled';
import type { Theme } from '@emotion/react';
import { IcDown } from '@/icons';

export type StatusTagTone = 'processing' | 'done' | 'hold' | 'absence';

type StatusTagButtonProps = {
  label: string;
  tone: StatusTagTone;
  isDropdown?: boolean;
  onClick?: () => void;
};

export const StatusTagButton = ({
  label,
  tone,
  isDropdown = false,
  onClick,
}: StatusTagButtonProps) => {
  const isInteractive = isDropdown || Boolean(onClick);

  if (!isInteractive) {
    return (
      <TagSpan $tone={tone}>
        <span>{label}</span>
      </TagSpan>
    );
  }

  return (
    <TagButton type="button" $tone={tone} onClick={onClick}>
      <span>{label}</span>
      {isDropdown ? <IcDown /> : null}
    </TagButton>
  );
};

const toneStyle = ({ $tone, theme }: { $tone: StatusTagTone; theme: Theme }) => ({
  border:
    $tone === 'absence'
      ? theme.colors.intent.absenceLate.border
      : $tone === 'processing'
        ? theme.colors.threadStatus.processing.border
        : $tone === 'hold'
          ? theme.colors.intent.request.border
          : theme.colors.threadStatus.completed.border,
  background:
    $tone === 'absence'
      ? theme.colors.intent.absenceLate.background
      : $tone === 'processing'
        ? theme.colors.threadStatus.processing.background
        : $tone === 'hold'
          ? theme.colors.intent.request.background
          : theme.colors.threadStatus.completed.background,
  text:
    $tone === 'absence'
      ? theme.colors.intent.absenceLate.text
      : $tone === 'processing'
        ? theme.colors.threadStatus.processing.text
        : $tone === 'hold'
          ? theme.colors.intent.request.text
          : theme.colors.threadStatus.completed.text,
});

const baseTagStyle = `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 10px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const TagButton = styled.button<{ $tone: StatusTagTone }>`
  ${({ theme }) => theme.fonts.labelXS};
  ${baseTagStyle}
  border: 1px solid ${({ $tone, theme }) => toneStyle({ $tone, theme }).border};
  background: ${({ $tone, theme }) => toneStyle({ $tone, theme }).background};
  color: ${({ $tone, theme }) => toneStyle({ $tone, theme }).text};
`;

const TagSpan = styled.span<{ $tone: StatusTagTone }>`
  ${({ theme }) => theme.fonts.labelXS};
  ${baseTagStyle}
  border: 1px solid ${({ $tone, theme }) => toneStyle({ $tone, theme }).border};
  background: ${({ $tone, theme }) => toneStyle({ $tone, theme }).background};
  color: ${({ $tone, theme }) => toneStyle({ $tone, theme }).text};
`;
