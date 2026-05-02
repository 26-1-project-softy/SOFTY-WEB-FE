import styled from '@emotion/styled';
import { IcDown } from '@/icons';

export type StatusTagTone = 'processing' | 'done' | 'absence';

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
    ${({ $tone }) => {
      if ($tone === 'absence') return '#E8B16E';
      if ($tone === 'processing') return '#8FCBC2';
      return '#BFC7D4';
    }};
  background: ${({ $tone }) => {
    if ($tone === 'absence') return '#FFF2E2';
    if ($tone === 'processing') return '#E6F7F2';
    return '#F3F5F8';
  }};
  color: ${({ $tone }) => {
    if ($tone === 'absence') return '#C56A17';
    if ($tone === 'processing') return '#3E8D80';
    return '#586072';
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;
