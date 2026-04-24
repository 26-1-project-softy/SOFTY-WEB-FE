import styled from '@emotion/styled';
import { LandingFeatureSectionTitle } from '@/components/auth/landing/LandingSectionTitle';
import { LandingTextLines } from '@/components/auth/landing/LandingTextLines';
import type { LandingContent } from '@/constants/landing';

type LandingSignupSectionProps = {
  id?: string;
  content: LandingContent['signup'];
};

export const LandingSignupSection = ({ id, content }: LandingSignupSectionProps) => {
  return (
    <Section id={id}>
      <SectionInner>
        <SectionGrid>
          <TextContainer>
            <LandingFeatureSectionTitle
              featureLabel={content.featureLabel}
              sectionTitle={content.title.join('\n')}
            />

            <Description>
              <LandingTextLines lines={content.description} />
            </Description>
          </TextContainer>

          <VisualContainer>
            <TeacherImageContainer>
              <TeacherImage src={content.images.teacher.src} alt={content.images.teacher.alt} />
            </TeacherImageContainer>

            <ParentImageContainer>
              <ParentImage src={content.images.parent.src} alt={content.images.parent.alt} />
            </ParentImageContainer>
          </VisualContainer>
        </SectionGrid>
      </SectionInner>
    </Section>
  );
};

const Section = styled.section`
  padding: 96px 16px;
  background: ${({ theme }) => theme.colors.background.bg2};

  @media (max-width: 768px) {
    padding: 72px 16px;
  }
`;

const SectionInner = styled.div`
  width: min(1140px, 80vw);
  margin: 0 auto;

  @media (max-width: 440px) {
    width: 100%;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  align-items: center;
  gap: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Description = styled.p`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const VisualContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 36px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const TeacherImageContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 36px;
`;

const TeacherImage = styled.img`
  width: min(320px, 100%);
  height: auto;
  object-fit: contain;
`;

const ParentImageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 52px;
`;

const ParentImage = styled.img`
  width: min(220px, 100%);
  height: auto;
  object-fit: contain;
`;
