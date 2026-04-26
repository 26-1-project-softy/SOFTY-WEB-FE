import styled from '@emotion/styled';
import type { RefCallback } from 'react';
import { HEADER_HEIGHT } from '@/constants/layout';

type TabsItem<T extends string> = {
  id: T;
  label: string;
};

type TabIndicatorStyle = {
  left: number;
  width: number;
};

interface TabsProps<T extends string> {
  items: TabsItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  indicatorStyle: TabIndicatorStyle;
  setTabRef: (id: T) => RefCallback<HTMLButtonElement>;
  borderColor?: string;
}

export const Tabs = <T extends string>({
  items,
  activeId,
  onChange,
  indicatorStyle,
  setTabRef,
}: TabsProps<T>) => {
  return (
    <TabsContainer role="tablist">
      {items.map(tab => (
        <TabButton
          key={tab.id}
          ref={setTabRef(tab.id)}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          $active={activeId === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
      <Indicator style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
    </TabsContainer>
  );
};

const TabsContainer = styled.div`
  position: sticky;
  top: ${HEADER_HEIGHT}px;
  display: flex;
  overflow-x: auto;
  background-color: ${({ theme }) => theme.colors.background.bg1};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  padding: 8px 12px 0;
  gap: 12px;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  white-space: nowrap;
  text-align: center;
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.brand.primary : theme.colors.text.text3};
  padding: 12px 8px;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.brand.primary : theme.colors.text.text1};
  }
`;

const Indicator = styled.div`
  position: absolute;
  bottom: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition:
    left 0.25s ease,
    width 0.25s ease;
`;
