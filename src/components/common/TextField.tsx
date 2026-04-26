import styled from '@emotion/styled';
import type { InputHTMLAttributes } from 'react';

type TextFieldProps = {
  label?: string;
  isRequired?: boolean;
  helperText?: string;
  errorMessage?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({
  label,
  isRequired = false,
  helperText,
  errorMessage,
  ...inputProps
}: TextFieldProps) => {
  const hasError = Boolean(errorMessage);
  const helperMessage = errorMessage ?? helperText;

  return (
    <FieldContainer>
      {label && (
        <FieldLabelContainer>
          <FieldLabelText $hasError={hasError}>{label}</FieldLabelText>
          {isRequired && <FieldRequiredMark>*</FieldRequiredMark>}
        </FieldLabelContainer>
      )}

      <FieldInput $hasError={hasError} {...inputProps} />

      {helperMessage && <HelperText $hasError={hasError}>{helperMessage}</HelperText>}
    </FieldContainer>
  );
};

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: min(calc(100vw - 32px - 80px), 361px);
  gap: 8px;
`;

const FieldLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FieldLabelText = styled.span<{ $hasError: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.semantic.error : theme.colors.text.text1};
`;

const FieldRequiredMark = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const FieldInput = styled.input<{ $hasError: boolean }>`
  height: 40px;
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
  background-color: ${({ theme }) => theme.colors.background.bg1};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error : theme.colors.border.border2};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 8px 12px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.text4};
  }

  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.brand.primary};
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const HelperText = styled.p<{ $hasError: boolean }>`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.semantic.error : theme.colors.text.text4};
`;
