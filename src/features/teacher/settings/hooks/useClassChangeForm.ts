import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import type { TeacherSetting } from '@/services/teacher/teacherApi';
import {
  getClassNumberErrorMessage,
  getGradeErrorMessage,
  getNumberDigits,
  getSchoolNameErrorMessage,
  validateNumberText,
  validateSchoolName,
} from '@/utils/teacherClassInfoValidation';
import { useChangeClassMutation } from '@/features/teacher/settings/mutations/useChangeClassMutation';

export const useClassChangeForm = (setting?: TeacherSetting) => {
  const { mutateAsync: changeTeacherClass, isPending: isClassChangeSubmitting } =
    useChangeClassMutation();

  const [isClassChangeModalOpen, setIsClassChangeModalOpen] = useState(false);
  const [isClassChangeConfirmModalOpen, setIsClassChangeConfirmModalOpen] = useState(false);
  const [isClassChangeSuccessModalOpen, setIsClassChangeSuccessModalOpen] = useState(false);

  const [classChangeErrorTitle, setClassChangeErrorTitle] = useState('');
  const [newClassCode, setNewClassCode] = useState('');

  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [classInput, setClassInput] = useState('');

  const classChangeFieldErrors = useMemo(
    () => ({
      schoolName: getSchoolNameErrorMessage(schoolNameInput),
      grade: getGradeErrorMessage(gradeInput),
      classNumber: getClassNumberErrorMessage(classInput),
    }),
    [classInput, gradeInput, schoolNameInput]
  );

  const isClassChangeEnabled =
    validateSchoolName(schoolNameInput) &&
    validateNumberText(gradeInput) &&
    validateNumberText(classInput) &&
    !isClassChangeSubmitting;

  const classSummaryText = useMemo(() => {
    if (!gradeInput.trim() || !classInput.trim()) {
      return '-';
    }

    return `${gradeInput}학년 ${classInput}반`;
  }, [classInput, gradeInput]);

  const handleOpenClassChangeModal = () => {
    setSchoolNameInput(setting?.schoolName ?? '');
    setGradeInput(setting?.grade != null ? String(setting.grade) : '');
    setClassInput(setting?.class != null ? String(setting.class) : '');
    setClassChangeErrorTitle('');
    setIsClassChangeModalOpen(true);
  };

  const handleCloseClassChangeModal = () => {
    setClassChangeErrorTitle('');
    setIsClassChangeModalOpen(false);
  };

  const handleChangeClassGrade = (value: string) => {
    setGradeInput(getNumberDigits(value));
  };

  const handleChangeClassNumber = (value: string) => {
    setClassInput(getNumberDigits(value));
  };

  const handleOpenClassChangeConfirmModal = () => {
    if (!isClassChangeEnabled) {
      return;
    }

    setIsClassChangeModalOpen(false);
    setClassChangeErrorTitle('');
    setIsClassChangeConfirmModalOpen(true);
  };

  const handleCloseClassChangeConfirmModal = () => {
    if (isClassChangeSubmitting) {
      return;
    }

    setClassChangeErrorTitle('');
    setIsClassChangeConfirmModalOpen(false);
  };

  const handleCloseClassChangeSuccessModal = () => {
    setIsClassChangeSuccessModalOpen(false);
  };

  const handleConfirmClassChange = async () => {
    if (!isClassChangeEnabled) {
      setClassChangeErrorTitle('학급 정보를 다시 확인해주세요.');
      return;
    }

    const nextGrade = Number(gradeInput);
    const nextClassNumber = Number(classInput);

    try {
      setClassChangeErrorTitle('');

      const response = await changeTeacherClass({
        schoolName: schoolNameInput.trim(),
        grade: nextGrade,
        class: nextClassNumber,
      });

      if (!response.success) {
        setClassChangeErrorTitle(response.message || '학급 변경에 실패했어요.');
        return;
      }

      setNewClassCode(response.classCode ?? response.data?.classCode ?? '');
      setIsClassChangeConfirmModalOpen(false);
      setIsClassChangeSuccessModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      setClassChangeErrorTitle(axiosError.response?.data?.message || '학급 변경에 실패했어요.');
    }
  };

  return {
    isClassChangeModalOpen,
    isClassChangeConfirmModalOpen,
    isClassChangeSuccessModalOpen,
    isClassChangeSubmitting,
    classChangeErrorTitle,
    newClassCode,
    schoolNameInput,
    gradeInput,
    classInput,
    classSummaryText,
    classChangeFieldErrors,
    isClassChangeEnabled,
    setSchoolNameInput,
    handleOpenClassChangeModal,
    handleCloseClassChangeModal,
    handleChangeClassGrade,
    handleChangeClassNumber,
    handleOpenClassChangeConfirmModal,
    handleCloseClassChangeConfirmModal,
    handleCloseClassChangeSuccessModal,
    handleConfirmClassChange,
  };
};
