import styled from '@emotion/styled';
import { ErrorReviewAccordionItem } from './ErrorReviewAccordionItem';
import type { ErrorReviewItem } from '@/features/admin/errorReview/types';

type ErrorReviewListProps = {
  items: ErrorReviewItem[];
  expandedId: number;
  onToggle: (id: number) => void;
};

export const ErrorReviewList = ({ items, expandedId, onToggle }: ErrorReviewListProps) => {
  return (
    <ListContainer>
      {items.map(item => (
        <ErrorReviewAccordionItem
          key={item.id}
          item={item}
          isExpanded={expandedId === item.id}
          onToggle={onToggle}
        />
      ))}
    </ListContainer>
  );
};

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 16px 24px;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;
