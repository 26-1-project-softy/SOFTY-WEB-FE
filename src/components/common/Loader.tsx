import styled from '@emotion/styled';

export const Loader = () => {
  // TODO: 추후 스타일 수정
  return <Wrapper>Loading...</Wrapper>;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #4b5563;
`;
