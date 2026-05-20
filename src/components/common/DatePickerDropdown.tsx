import { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from '@emotion/styled';
import { IcDown } from '@/icons';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type DatePickerDropdownProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export const DatePickerDropdown = ({ value, placeholder, onChange }: DatePickerDropdownProps) => {
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

  const handleDateChange = (selectedDate: Date | Date[] | null) => {
    if (selectedDate instanceof Date) {
      onChange(formatDate(selectedDate));
      setOpen(false);
    }
  };

  return (
    <DropdownWrap ref={wrapperRef}>
      <DropdownButton type="button" onClick={() => setOpen(prev => !prev)}>
        <LabelText $hasValue={Boolean(value)}>{value || placeholder}</LabelText>
        <Arrow $open={open}>
          <IcDown />
        </Arrow>
      </DropdownButton>

      {open ? (
        <CalendarContainer>
          <Calendar
            onChange={handleDateChange}
            value={value ? new Date(value) : null}
            calendarType="gregory"
            formatDay={(_, date) => String(date.getDate())}
            next2Label={null}
            prev2Label={null}
          />
        </CalendarContainer>
      ) : null}
    </DropdownWrap>
  );
};

const DropdownWrap = styled.div`
  position: relative;
  width: 100%;
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
  cursor: pointer;

  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.brand.primary};
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const LabelText = styled.span<{ $hasValue: boolean }>`
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.text.text1 : theme.colors.text.text4};
`;

const Arrow = styled.span<{ $open: boolean }>`
  display: inline-flex;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 0.2s ease;
  color: ${({ theme }) => theme.colors.text.text3};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CalendarContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;

  .react-calendar {
    width: 290px;
    background: ${({ theme }) => theme.colors.background.bg1};
    border: 1px solid ${({ theme }) => theme.colors.border.border1};
    border-radius: 16px;
    font-family: inherit;
    box-shadow: ${({ theme }) => theme.colors.shadow.toast};
    padding: 12px;
  }

  .react-calendar__navigation {
    display: flex;
    height: 40px;
    margin-bottom: 8px;

    button {
      min-width: 32px;
      background: none;
      font-size: 15px;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.text1};
      border-radius: 6px;

      &:hover,
      &:focus {
        background-color: ${({ theme }) => theme.colors.background.bg3};
      }

      &:disabled {
        background-color: transparent;
      }
    }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    font-weight: 600;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.text3};
    margin-bottom: 8px;

    abbr {
      text-decoration: none;
    }
  }

  .react-calendar__tile {
    max-width: 100%;
    height: 36px;
    background: none;
    text-align: center;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.text1};
    border-radius: 8px;
    transition: all 0.1s ease;

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.bg3};
    }
  }

  .react-calendar__tile--now {
    background: ${({ theme }) => theme.colors.background.bg4} !important;
    color: ${({ theme }) => theme.colors.brand.primary} !important;
    font-weight: 700;
  }

  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.brand.primary} !important;
    color: ${({ theme }) => theme.colors.text.textW} !important;
    font-weight: 600;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.colors.brand.primary} !important;
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: ${({ theme }) => theme.colors.text.text4} !important;
  }
`;
