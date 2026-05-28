import styled from '@emotion/styled';

type ToggleSwitchProps = {
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  disabled?: boolean;
};

export const ToggleSwitch = ({
  checked,
  onToggle,
  ariaLabel,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <ToggleButton
      type="button"
      aria-pressed={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onToggle}
    >
      <ToggleThumb $checked={checked} />
    </ToggleButton>
  );
};

const ToggleButton = styled.button`
  position: relative;
  width: 44px;
  height: 26px;
  padding: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg5};
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;

  &[aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.brand.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ToggleThumb = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.toggleThumb};
  transform: translateX(${({ $checked }) => ($checked ? '18px' : '0')});
  transition: transform 0.2s ease;
`;
