import styled from '@emotion/styled';

export const Loader = () => {
  return <Wrapper>Loading...</Wrapper>;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.text2};
`;
