import styled from '@emotion/styled';

export const FooterCopyright = () => {
  return <CopyrightText>© 2026, 소프티 All rights reserved.</CopyrightText>;
};

const CopyrightText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
  text-align: center;
`;
