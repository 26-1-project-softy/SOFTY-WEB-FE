import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IcDown } from '@/icons';

type DropdownValue = string | number;

type DropdownOption<T extends DropdownValue> = {
  label: string;
  value: T;
};

type SelectDropdownProps<T extends DropdownValue> = {
  value: T;
  options: readonly DropdownOption<T>[];
  placeholder?: string;
  hasSelected?: boolean;
  onChange: (value: T) => void;
};

export const SelectDropdown = <T extends DropdownValue>({
  value,
  options,
  placeholder,
  hasSelected = true,
  onChange,
}: SelectDropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(option => option.value === value) ?? options[0];
  const label = hasSelected ? selectedOption.label : (placeholder ?? selectedOption.label);

  return (
    <DropdownWrap ref={wrapperRef}>
      <DropdownButton type="button" onClick={() => setOpen(prev => !prev)}>
        <span>{label}</span>
        <Arrow $open={open}>
          <IcDown />
        </Arrow>
      </DropdownButton>

      {open ? (
        <DropdownMenu>
          {options.map(option => (
            <DropdownOptionButton
              key={String(option.value)}
              type="button"
              $active={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </DropdownOptionButton>
          ))}
        </DropdownMenu>
      ) : null}
    </DropdownWrap>
  );
};

const DropdownWrap = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  display: flex;
  width: 100%;
  height: 42px;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 0 14px;

  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.brand.primary};
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const Arrow = styled.span<{ $open: boolean }>`
  display: inline-flex;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 20;
  width: 100%;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.toast};
`;

const DropdownOptionButton = styled.button<{ $active: boolean }>`
  ${({ theme }) => theme.fonts.labelS};
  width: 100%;
  height: 40px;
  border: 0;
  background: ${({ $active, theme }) => ($active ? theme.colors.background.bg4 : 'transparent')};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.brand.primary : theme.colors.text.text1};
  border-radius: 10px;
  text-align: left;
  padding: 0 12px;
`;
