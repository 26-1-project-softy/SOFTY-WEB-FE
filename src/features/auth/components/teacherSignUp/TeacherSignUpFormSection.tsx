import type { FormEventHandler } from 'react';
import { IcInfo } from '@/icons';
import type { TeacherSignUpFieldErrors } from '@/features/auth/lib/teacherSignUpValidation';
import type { AuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';
import {
  Description,
  ErrorBox,
  ErrorDescription,
  ErrorIcon,
  ErrorMessageGroup,
  ErrorTitle,
  FieldErrorText,
  InlineTwoColumn,
  Input,
  InputGroup,
  Label,
  PrimaryButton,
  RequiredMark,
  SignUpForm,
  Title,
} from '@/features/auth/components/teacherSignUp/TeacherSignUpFormSectionStyles';

type TeacherSignUpFormSectionProps = {
  teacherName: string;
  schoolName: string;
  grade: string;
  classNumber: string;
  fieldErrors: TeacherSignUpFieldErrors;
  globalError: AuthErrorMessage | null;
  isSignUpEnabled: boolean;
  isSubmitting: boolean;
  onTeacherNameChange: (value: string) => void;
  onSchoolNameChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onClassNumberChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const TeacherSignUpFormSection = ({
  teacherName,
  schoolName,
  grade,
  classNumber,
  fieldErrors,
  globalError,
  isSignUpEnabled,
  isSubmitting,
  onTeacherNameChange,
  onSchoolNameChange,
  onGradeChange,
  onClassNumberChange,
  onSubmit,
}: TeacherSignUpFormSectionProps) => {
  return (
    <>
      <Title>교사 정보 입력</Title>
      <Description>가입을 위해 선생님의 정보를 입력해주세요.</Description>

      <SignUpForm onSubmit={onSubmit}>
        <InputGroup>
          <Label htmlFor="teacherName" hasError={Boolean(fieldErrors.teacherName)}>
            이름 <RequiredMark>*</RequiredMark>
          </Label>
          <Input
            id="teacherName"
            name="teacherName"
            value={teacherName}
            onChange={event => onTeacherNameChange(event.target.value)}
            placeholder="홍길동"
            hasError={Boolean(fieldErrors.teacherName)}
          />
          {fieldErrors.teacherName ? (
            <FieldErrorText>{fieldErrors.teacherName}</FieldErrorText>
          ) : null}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="schoolName" hasError={Boolean(fieldErrors.schoolName)}>
            학교명<RequiredMark>*</RequiredMark>
          </Label>
          <Input
            id="schoolName"
            name="schoolName"
            value={schoolName}
            onChange={event => onSchoolNameChange(event.target.value)}
            placeholder="한국초등학교"
            hasError={Boolean(fieldErrors.schoolName)}
          />
          {fieldErrors.schoolName ? (
            <FieldErrorText>{fieldErrors.schoolName}</FieldErrorText>
          ) : null}
        </InputGroup>

        <InlineTwoColumn>
          <InputGroup>
            <Label htmlFor="grade" hasError={Boolean(fieldErrors.grade)}>
              학년 <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="grade"
              name="grade"
              value={grade}
              onChange={event => onGradeChange(event.target.value)}
              placeholder="3"
              hasError={Boolean(fieldErrors.grade)}
            />
            {fieldErrors.grade ? <FieldErrorText>{fieldErrors.grade}</FieldErrorText> : null}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="classNumber" hasError={Boolean(fieldErrors.classNumber)}>
              반<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="classNumber"
              name="classNumber"
              value={classNumber}
              onChange={event => onClassNumberChange(event.target.value)}
              placeholder="2"
              hasError={Boolean(fieldErrors.classNumber)}
            />
            {fieldErrors.classNumber ? (
              <FieldErrorText>{fieldErrors.classNumber}</FieldErrorText>
            ) : null}
          </InputGroup>
        </InlineTwoColumn>

        {globalError ? (
          <ErrorBox role="alert">
            <ErrorIcon>
              <IcInfo />
            </ErrorIcon>
            <ErrorMessageGroup>
              <ErrorTitle>{globalError.title}</ErrorTitle>
              <ErrorDescription>{globalError.description}</ErrorDescription>
            </ErrorMessageGroup>
          </ErrorBox>
        ) : null}

        <PrimaryButton
          type="submit"
          variant="primary"
          size="L"
          width="100%"
          label={isSubmitting ? '가입 중...' : '가입하기'}
          disabled={!isSignUpEnabled}
        />
      </SignUpForm>
    </>
  );
};
