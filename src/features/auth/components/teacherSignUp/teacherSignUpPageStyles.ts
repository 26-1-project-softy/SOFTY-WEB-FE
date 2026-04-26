import styled from '@emotion/styled';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg5};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 28px;
`;

export const Card = styled.section`
  width: 100%;
  max-width: 430px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg3};
  box-shadow: 0 10px 20px ${({ theme }) => `${theme.colors.neutral.neutral1100}29`};
  padding: 18px 36px 30px;

  @media (max-width: 640px) {
    padding: 18px 18px 24px;
    border-radius: 16px;
  }
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutral.neutral400};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.2s ease;
`;

export const Title = styled.h1`
  ${({ theme }) => theme.fonts.title2};
  margin: 34px 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.text1};
`;

export const Description = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
  text-align: center;
`;

export const SignUpForm = styled.form`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const InlineTwoColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label<{ hasError?: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ hasError, theme }) =>
    hasError ? theme.colors.semantic.error : theme.colors.text.text1};
`;

export const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
`;

export const Input = styled.input<{ hasError?: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid
    ${({ hasError, theme }) =>
      hasError ? theme.colors.semantic.error : theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg3};
  padding: 11px 12px;
  color: ${({ theme }) => theme.colors.text.text1};

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.neutral500};
  }

  &:focus {
    outline: none;
    border-color: ${({ hasError, theme }) =>
      hasError ? theme.colors.semantic.error : theme.colors.brand.primary};
    box-shadow: ${({ hasError, theme }) =>
      hasError
        ? `0 0 0 2px ${theme.colors.semantic.error}24`
        : `0 0 0 2px ${theme.colors.brand.primary}29`};
  }
`;

export const FieldErrorText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

export const ErrorBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error};
  background: ${({ theme }) => theme.colors.semantic.errorSoft};
  padding: 14px 16px;
`;

export const ErrorIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ErrorMessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

export const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
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

export const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
  margin: 18px 0 0;
`;
