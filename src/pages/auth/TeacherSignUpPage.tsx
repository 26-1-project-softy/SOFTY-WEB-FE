import { TeacherSignUpForm } from '@/features/auth/components/TeacherSignUpForm';
import { useTeacherSignUpForm } from '@/features/auth/hooks/useTeacherSignUpForm';

export const TeacherSignUpPage = () => {
  const formState = useTeacherSignUpForm();
  return <TeacherSignUpForm {...formState} />;
};
