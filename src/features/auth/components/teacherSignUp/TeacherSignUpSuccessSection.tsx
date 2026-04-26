import { IcCheck } from '@/icons';
import {
  PrimaryButton,
  SuccessDescription,
  SuccessIconContainer,
  SuccessSection,
  SuccessTitle,
} from '@/features/auth/components/teacherSignUp/TeacherSignUpStatusSectionStyles';

type TeacherSignUpSuccessSectionProps = {
  isCreatingClassCode: boolean;
  onOpenClassCodeModal: () => void;
};

export const TeacherSignUpSuccessSection = ({
  isCreatingClassCode,
  onOpenClassCodeModal,
}: TeacherSignUpSuccessSectionProps) => {
  return (
    <SuccessSection>
      <SuccessIconContainer>
        <IcCheck />
      </SuccessIconContainer>
      <SuccessTitle>가입 완료</SuccessTitle>
      <SuccessDescription>
        교사 가입이 완료되었어요.
        <br />
        이제 학급을 개설하고, 학부모님과 안전한 소통을 시작해보세요.
      </SuccessDescription>
      <PrimaryButton type="button" onClick={onOpenClassCodeModal} disabled={isCreatingClassCode}>
        {isCreatingClassCode ? '학급 코드 생성 중...' : '학급 개설하기'}
      </PrimaryButton>
    </SuccessSection>
  );
};
