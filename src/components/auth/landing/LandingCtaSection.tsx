import styled from '@emotion/styled';
import { LandingActionButtons } from '@/components/auth/landing/LandingActionButtons';
import { LandingTextLines } from '@/components/auth/landing/LandingTextLines';
import type { LandingContent } from '@/constants/landing';

type LandingCtaSectionProps = {
  content: LandingContent['cta'];
  onOpenParentAppInstallDialog: () => void;
  onScrollToFeature: () => void;
};

export const LandingCtaSection = ({
  content,
  onOpenParentAppInstallDialog,
  onScrollToFeature,
}: LandingCtaSectionProps) => {
  return (
    <Section>
      <SectionInner>
        <TextContainer>
          <Title>
            <LandingTextLines lines={content.title} />
          </Title>

          <Description>
            <LandingTextLines lines={content.description} />
          </Description>
        </TextContainer>

        <ActionContainer>
          <LandingActionButtons
            actions={content.actions}
            align="center"
            onOpenModal={onOpenParentAppInstallDialog}
            onScrollToFeature={onScrollToFeature}
          />
        </ActionContainer>
      </SectionInner>
    </Section>
  );
};

const Section = styled.section`
  padding: 88px 16px 72px;
  background: ${({ theme }) => theme.colors.background.bg1};

  @media (max-width: 768px) {
    padding: 72px 16px 56px;
  }
`;

const SectionInner = styled.div`
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Title = styled.h2`
  text-align: center;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.title1};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.title2};
  }
`;

const Description = styled.p`
  text-align: center;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ActionContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
