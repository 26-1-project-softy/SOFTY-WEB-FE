import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { Dialog } from '@/components/common/Dialog';
import { DialogHeader } from '@/components/common/DialogHeader';
import { DialogFooter } from '@/components/common/DialogFooter';
import { InlineButton } from '@/components/common/InlineButton';
import { TextField } from '@/components/common/TextField';
import { IcChange } from '@/icons';

type ClassChangeFieldErrors = {
  schoolName?: string;
  grade?: string;
  classNumber?: string;
};

type ClassChangeFormDialogProps = {
  isOpen: boolean;
  schoolNameInput: string;
  gradeInput: string;
  classInput: string;
  fieldErrors: ClassChangeFieldErrors;
  isSubmitEnabled: boolean;
  onClose: () => void;
  onChangeSchoolName: (value: string) => void;
  onChangeGrade: (value: string) => void;
  onChangeClassNumber: (value: string) => void;
  onSubmit: () => void;
};

export const ClassChangeFormDialog = ({
  isOpen,
  schoolNameInput,
  gradeInput,
  classInput,
  fieldErrors,
  isSubmitEnabled,
  onClose,
  onChangeSchoolName,
  onChangeGrade,
  onChangeClassNumber,
  onSubmit,
}: ClassChangeFormDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader
        icon={IcChange}
        title="학급 변경"
        description="새 학급 정보를 입력해주세요. 변경이 완료되면 새로운 학급 코드가 발급돼요."
        iconBgColor={theme.colors.background.bg4}
        iconColor={theme.colors.brand.dark}
      />

      <ClassChangeForm>
        <TextField
          id="classChangeSchoolName"
          name="classChangeSchoolName"
          label="학교명"
          isRequired
          value={schoolNameInput}
          onChange={event => onChangeSchoolName(event.target.value)}
          placeholder="학교명을 입력해주세요."
          autoComplete="off"
          errorMessage={fieldErrors.schoolName}
        />

        <FormRow>
          <FieldInput
            id="classChangeGrade"
            name="classChangeGrade"
            inputMode="numeric"
            label="학년"
            isRequired
            value={gradeInput}
            onChange={event => onChangeGrade(event.target.value)}
            placeholder="3"
            autoComplete="off"
            errorMessage={fieldErrors.grade}
          />

          <FieldInput
            id="classChangeClassNumber"
            name="classChangeClassNumber"
            inputMode="numeric"
            label="반"
            isRequired
            value={classInput}
            onChange={event => onChangeClassNumber(event.target.value)}
            placeholder="2"
            autoComplete="off"
            errorMessage={fieldErrors.classNumber}
          />
        </FormRow>
      </ClassChangeForm>

      <DialogFooter>
        <InlineButton variant="ghost" size="L" label="취소" width="100%" onClick={onClose} />
        <InlineButton
          variant="primary"
          size="L"
          label="변경하기"
          width="100%"
          disabled={!isSubmitEnabled}
          onClick={onSubmit}
        />
      </DialogFooter>
    </Dialog>
  );
};

const ClassChangeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const FieldInput = styled(TextField)`
  width: 100%;
  min-width: 0;
`;
