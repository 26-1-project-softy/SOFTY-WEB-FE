import styled from '@emotion/styled';

type ToggleSwitchProps = {
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
};

export const ToggleSwitch = ({ checked, onToggle, ariaLabel }: ToggleSwitchProps) => {
  return (
    <ToggleButton type="button" aria-pressed={checked} aria-label={ariaLabel} onClick={onToggle}>
      <ToggleThumb $checked={checked} />
    </ToggleButton>
  );
};

const ToggleButton = styled.button`
  width: 44px;
  height: 26px;
  border: none;
  border-radius: 999px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: ${({ theme }) => theme.colors.neutral.neutral200};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &[aria-pressed='true'] {
    justify-content: flex-end;
    background: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const ToggleThumb = styled.span<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${({ $checked }) => ($checked ? '#ffffff' : '#f3f4f5')};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
`;
