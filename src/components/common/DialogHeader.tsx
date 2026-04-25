import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { IconBadge } from '@/components/common/IconBadge';
import type { IconComponent } from '@/types/icon';

type DialogHeaderProps = {
  icon: IconComponent;
  title: string;
  description?: ReactNode;
  iconBgColor: string;
  iconColor: string;
};

export const DialogHeader = ({
  icon,
  title,
  description,
  iconBgColor,
  iconColor,
}: DialogHeaderProps) => {
  return (
    <DialogHeaderContainer>
      <IconBadge icon={icon} bgColor={iconBgColor} color={iconColor} />

      <Title>{title}</Title>

      {description ? <Description>{description}</Description> : null}
    </DialogHeaderContainer>
  );
};

const DialogHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const Title = styled.h2`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.div`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text2};
`;
