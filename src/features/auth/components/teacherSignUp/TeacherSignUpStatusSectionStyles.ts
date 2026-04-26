import styled from '@emotion/styled';

export const SuccessSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 44px;
`;

export const SuccessIconContainer = styled.span`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};

  svg {
    width: 30px;
    height: 30px;
  }
`;

export const SuccessTitle = styled.h2`
  ${({ theme }) => theme.fonts.title2};
  margin: 34px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

export const SuccessDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 14px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
  text-align: center;
  line-height: 1.7;
`;

export const ClassCodeCard = styled.div`
  width: 100%;
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.threadStatus.processing.border};
  background: ${({ theme }) => theme.colors.threadStatus.processing.background};
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const ClassLabel = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.dark};
`;

export const ClassCode = styled.p`
  ${({ theme }) => theme.fonts.title2};
  margin: 0;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.text.text1};
`;

export const CopyButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 16px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PrimaryButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 14px;
  color: ${({ theme }) => theme.colors.text.textW};
  background: ${({ theme }) => theme.colors.brand.primary};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.brandHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.neutral.neutral300};
    color: ${({ theme }) => theme.colors.neutral.neutral600};
    cursor: not-allowed;
  }
`;
