import styled from '@emotion/styled';
import { INQUIRY_STATUS_COLOR_KEY, type InquiryStatusType } from '@/constants/inquiryStatus';
import { IcDown } from '@/icons';

type StatusTagButtonProps = {
  label: string;
  status: InquiryStatusType;
  isDropdown?: boolean;
  onClick?: () => void;
};

export const StatusTagButton = ({
  label,
  status,
  isDropdown = false,
  onClick,
}: StatusTagButtonProps) => {
  const isInteractive = isDropdown || Boolean(onClick);

  if (!isInteractive) {
    return (
      <TagText $status={status}>
        <span>{label}</span>
      </TagText>
    );
  }

  return (
    <TagButton type="button" $status={status} onClick={onClick}>
      <span>{label}</span>
      {isDropdown ? <IcDown /> : null}
    </TagButton>
  );
};

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

const TagButton = styled.button<{ $status: InquiryStatusType }>`
  ${({ theme }) => theme.fonts.labelXS};
  ${baseTagStyle}

  ${({ $status, theme }) => {
    const colorKey = INQUIRY_STATUS_COLOR_KEY[$status];
    const color = theme.colors.threadStatus[colorKey];

    return `
      border: 1px solid ${color.border};
      background: ${color.background};
      color: ${color.text};
    `;
  }}
`;

const TagText = styled.span<{ $status: InquiryStatusType }>`
  ${({ theme }) => theme.fonts.labelXS};
  ${baseTagStyle}

  ${({ $status, theme }) => {
    const colorKey = INQUIRY_STATUS_COLOR_KEY[$status];
    const color = theme.colors.threadStatus[colorKey];

    return `
      border: 1px solid ${color.border};
      background: ${color.background};
      color: ${color.text};
    `;
  }}
`;
