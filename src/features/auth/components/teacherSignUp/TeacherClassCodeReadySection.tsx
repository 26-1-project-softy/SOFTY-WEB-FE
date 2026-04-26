import { IcCopy, IcSparkles } from '@/icons';
import {
  ClassCode,
  ClassCodeCard,
  ClassLabel,
  CopyButton,
  PrimaryButton,
  SuccessDescription,
  SuccessIconContainer,
  SuccessSection,
  SuccessTitle,
} from '@/features/auth/components/teacherSignUp/TeacherSignUpStatusSectionStyles';

type TeacherClassCodeReadySectionProps = {
  schoolName: string;
  grade: string;
  classNumber: string;
  generatedClassCode: string;
  onCopyClassCode: () => void;
  onGoToInbox: () => void;
};

export const TeacherClassCodeReadySection = ({
  schoolName,
  grade,
  classNumber,
  generatedClassCode,
  onCopyClassCode,
  onGoToInbox,
}: TeacherClassCodeReadySectionProps) => {
  return (
    <SuccessSection>
      <SuccessIconContainer>
        <IcSparkles />
      </SuccessIconContainer>
      <SuccessTitle>학급 코드 생성 완료</SuccessTitle>
      <SuccessDescription>
        학급이 개설되었어요.
        <br />
        생성된 학급 코드를 학부모님들께 공유해주세요.
      </SuccessDescription>

      <ClassCodeCard>
        <ClassLabel>
          {schoolName || '한국초등학교'} {grade || '3'}학년 {classNumber || '2'}반
        </ClassLabel>
        <ClassCode>{generatedClassCode}</ClassCode>
      </ClassCodeCard>

      <CopyButton type="button" onClick={onCopyClassCode}>
        <IcCopy />
        학급코드 복사하기
      </CopyButton>

      <PrimaryButton type="button" onClick={onGoToInbox}>
        수신함으로 이동
      </PrimaryButton>
    </SuccessSection>
  );
};
