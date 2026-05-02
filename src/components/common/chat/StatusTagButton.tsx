import styled from '@emotion/styled';
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
  return (
    <TagButton type="button" $tone={tone} onClick={onClick}>
      <span>{label}</span>
      {isDropdown ? <IcDown /> : null}
    </TagButton>
  );
};

const TagButton = styled.button<{ $tone: StatusTagTone }>`
  ${({ theme }) => theme.fonts.labelXS};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid
    ${({ $tone, theme }) => {
      if ($tone === 'absence') return theme.colors.intent.absenceLate.border;
      if ($tone === 'processing') return theme.colors.threadStatus.processing.border;
      if ($tone === 'hold') return theme.colors.intent.request.border;
      return theme.colors.threadStatus.completed.border;
    }};
  background: ${({ $tone, theme }) => {
    if ($tone === 'absence') return theme.colors.intent.absenceLate.background;
    if ($tone === 'processing') return theme.colors.threadStatus.processing.background;
    if ($tone === 'hold') return theme.colors.intent.request.background;
    return theme.colors.threadStatus.completed.background;
  }};
  color: ${({ $tone, theme }) => {
    if ($tone === 'absence') return theme.colors.intent.absenceLate.text;
    if ($tone === 'processing') return theme.colors.threadStatus.processing.text;
    if ($tone === 'hold') return theme.colors.intent.request.text;
    return theme.colors.threadStatus.completed.text;
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;
