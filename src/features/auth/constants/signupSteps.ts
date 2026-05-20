import type { SignUpStep } from '@/features/auth/hooks/useTeacherSignUpForm';
import type { IconComponent } from '@/types/icon';
import { IcCheck, IcSparkles } from '@/icons';

export const TEACHER_SIGN_UP_STEP_CONTENT = {
  FORM: {
    progressRatio: 0.33,
    iconBadge: null,
    title: '교사 정보 입력',
    description: '가입을 위해 선생님의 정보를 입력해주세요.',
    actionLabel: '가입하기',
  },
  SIGN_UP_SUCCESS: {
    progressRatio: 0.66,
    iconBadge: IcCheck,
    title: '가입 완료',
    description: `교사 가입이 완료되었어요.
이제 학급을 개설하고, 학부모님과 안전한 소통을 시작해보세요.`,
    actionLabel: '학급 개설하기',
  },
  CLASS_CODE_READY: {
    progressRatio: 1,
    iconBadge: IcSparkles,
    title: '학급 코드 생성 완료',
    description: `학급이 개설되었어요.
생성된 학급 코드를 학부모님들께 공유해주세요.`,
    actionLabel: '수신함으로 이동',
  },
} satisfies Record<
  SignUpStep,
  {
    progressRatio: number;
    iconBadge: IconComponent | null;
    title: string;
    description: string;
    actionLabel: string;
  }
>;
