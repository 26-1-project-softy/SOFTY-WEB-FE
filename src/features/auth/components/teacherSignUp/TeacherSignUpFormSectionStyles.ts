import styled from '@emotion/styled';
import { InlineButton } from '@/components/common/InlineButton';

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

export const PrimaryButton = styled(InlineButton)`
  margin-top: 8px;
  width: 100%;
  height: 52px;
`;
