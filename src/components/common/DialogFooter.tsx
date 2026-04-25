import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type DialogFooterProps = {
  children: ReactNode;
};

export const DialogFooter = ({ children }: DialogFooterProps) => {
  return <DialogFooterContainer>{children}</DialogFooterContainer>;
};

const DialogFooterContainer = styled.div`
  display: flex;
  gap: 10px;

  > * {
    flex: 1;
    min-width: 0;
  }
`;
