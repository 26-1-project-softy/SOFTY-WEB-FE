import styled from '@emotion/styled';
// import { useParams } from 'react-router-dom';

export const TeacherThreadDetailPage = () => {
  // const { threadId } = useParams();

  return <ThreadDetailPageContainer title="채팅방 페이지" />;
};

const ThreadDetailPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;
