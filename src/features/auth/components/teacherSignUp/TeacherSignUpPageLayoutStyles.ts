import styled from '@emotion/styled';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg5};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 28px;
`;

export const Card = styled.section`
  width: 100%;
  max-width: 430px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg3};
  box-shadow: 0 10px 20px ${({ theme }) => `${theme.colors.neutral.neutral1100}29`};
  padding: 18px 36px 30px;

  @media (max-width: 640px) {
    padding: 18px 18px 24px;
    border-radius: 16px;
  }
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutral.neutral400};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.2s ease;
`;

export const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text4};
  margin: 18px 0 0;
`;
