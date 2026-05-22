import styled from '@emotion/styled';

type FieldLabelProps = {
  label: string;
  isRequired?: boolean;
  hasError?: boolean;
};

export const FieldLabel = ({ label, isRequired = false, hasError = false }: FieldLabelProps) => (
  <LabelWrap>
    <LabelText $hasError={hasError}>{label}</LabelText>
    {isRequired ? <RequiredMark>*</RequiredMark> : null}
  </LabelWrap>
);

const LabelWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const LabelText = styled.span<{ $hasError: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.semantic.error : theme.colors.text.text1};
  white-space: nowrap;
`;

const RequiredMark = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.semantic.error};
`;
