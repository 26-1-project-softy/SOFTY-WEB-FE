import styled from '@emotion/styled';
import type { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hasError?: boolean;
};

export const TextField = ({ id, label, hasError = false, ...inputProps }: TextFieldProps) => {
  return (
    <FieldGroup>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldInput id={id} hasError={hasError} {...inputProps} />
    </FieldGroup>
  );
};

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldLabel = styled.label`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const FieldInput = styled.input<{ hasError?: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  border: 1px solid
    ${({ hasError, theme }) =>
      hasError ? theme.colors.semantic.error : theme.colors.border.border2};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg3};
  padding: 13px 14px;
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
