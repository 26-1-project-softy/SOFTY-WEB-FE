import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { teacherSignupApi, createClassCodeApi } from '../../services/api/auth';
import './TeacherSignup.css';

const TeacherSignup: React.FC = () => {
  const [step, setStep] = useState(1);
  
  // 폼 상태
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [classNum, setClassNum] = useState('');
  
  // 에러 및 터치 상태
  const [nameTouched, setNameTouched] = useState(false);
  const [signupError, setSignupError] = useState(false);
  const [signupErrorMessage, setSignupErrorMessage] = useState('잠시 후 다시 시도해 주세요.');
  
  // 학급 코드
  const [classCode, setClassCode] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '교사 회원가입 - 소프티';
  }, []);

  const isNameValid = name.trim().length >= 2;
  const isFormValid = isNameValid && school.trim() !== '' && grade !== '' && classNum.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    
    if (!isFormValid) return;
    
    // [임시 에러 테스트용] 이름이 'error'이면 강제로 에러 박스 노출
    try {
      const pendingKakaoAccessToken =
        localStorage.getItem('pendingKakaoAccessToken') || localStorage.getItem('accessToken');

      if (!pendingKakaoAccessToken) {
        alert('카카오 인증 정보가 없습니다. 로그인부터 다시 진행해주세요.');
        navigate('/teacher/login');
        return;
      }

      const parsedClassNum = Number(classNum.replace(/[^0-9]/g, ''));
      
      const response = await teacherSignupApi(
        pendingKakaoAccessToken,
        name,
        school,
        parseInt(grade, 10),
        parsedClassNum || 0 // 문자가 들어온 경우 0으로 처리 (보통 숫자입력 강제하지만 예외처리)
      );

      if (response.success) {
        setSignupError(false);
        setSignupErrorMessage('가입이 완료되었습니다.');
        localStorage.removeItem('pendingKakaoAccessToken');
        setStep(2); // 가입 완료 2단계로 이동
      } else {
        setSignupErrorMessage(response.message || '잠시 후 다시 시도해 주세요.');
        setSignupError(true);
      }
    } catch (error) {
      console.error('Teacher signup failed:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      const serverMessage = axiosError.response?.data?.message;
      setSignupErrorMessage(serverMessage || '잠시 후 다시 시도해 주세요.');
      setSignupError(true);
    }
  };

  const handleCreateClass = async () => {
    try {
      const response = await createClassCodeApi();
      if (response.success && response.data?.classCode) {
        setClassCode(response.data.classCode);
        setStep(3);
      } else {
        alert('학급 코드 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Class code creation error:', error);
      alert('학급 코드 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="card signup-card border-0 shadow-sm">
          
          {/* STEP 1: 정보 입력폼 */}
          {step === 1 && (
            <div className="card-body px-4 py-5 px-sm-5 py-sm-5">
              <div className="progress-bar-wrapper mb-5">
                <div className="progress-bar-fill" style={{ width: '33%' }}></div>
              </div>

              <div className="text-center mb-5">
                <h4 className="fw-bold signup-title mb-3">교사 정보 입력</h4>
                <p className="signup-subtitle">가입을 위해 선생님의 정보를 입력해주세요.</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="teacherName" className="form-label fw-bold signup-label">
                    이름 <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={`form-control signup-input ${nameTouched && !isNameValid ? 'input-error' : ''}`}
                    id="teacherName" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (signupError) setSignupError(false); // 타이핑 시 에러박스 숨김
                    }}
                    onBlur={() => setNameTouched(true)}
                    placeholder="홍길동" 
                  />
                  {nameTouched && !isNameValid && (
                    <div className="text-danger error-text-small mt-2">이름을 2자 이상 입력해주세요.</div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="schoolName" className="form-label fw-bold signup-label">
                    학교명 <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control signup-input" 
                    id="schoolName" 
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="한국초등학교" 
                  />
                </div>

                <div className="row mb-5">
                  <div className="col-8 pe-2">
                    <label htmlFor="gradeSelect" className="form-label fw-bold signup-label">
                      학년 <span className="text-danger">*</span>
                    </label>
                    <select 
                      className="form-select signup-input" 
                      id="gradeSelect"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    >
                      <option value="" disabled>학년을 선택해주세요.</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                      <option value="4">4학년</option>
                      <option value="5">5학년</option>
                      <option value="6">6학년</option>
                    </select>
                  </div>
                  <div className="col-4 ps-2">
                    <label htmlFor="classInput" className="form-label fw-bold signup-label">
                      반 <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control signup-input" 
                      id="classInput"
                      value={classNum}
                      onChange={(e) => setClassNum(e.target.value)}
                      placeholder="1반" 
                    />
                  </div>
                </div>
                
                {signupError && (
                  <div className="error-box mb-4">
                    <div className="error-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <div>
                      <div className="error-text-main">회원가입 중 문제가 발생했어요</div>
                      <div className="error-text-sub">{signupErrorMessage}</div>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={`btn w-100 fw-bold signup-btn ${isFormValid ? 'active' : ''}`}
                >
                  가입하기
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: 가입 완료 화면 */}
          {step === 2 && (
            <div className="card-body px-4 py-5 px-sm-5 py-sm-5 text-center step-container">
              <div className="progress-bar-wrapper mb-5">
                <div className="progress-bar-fill" style={{ width: '66%' }}></div>
              </div>

              <div className="step-icon-wrapper mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h4 className="fw-bold signup-title mb-3">가입 완료</h4>
              <p className="signup-subtitle mb-5">
                교사 가입이 완료되었어요.<br />
                이제 학급을 개설하고, 학부모님과 안전한 소통을 시작해보세요.
              </p>

              <button 
                className="btn w-100 fw-bold signup-btn active mt-3"
                onClick={handleCreateClass}
              >
                학급 개설하기
              </button>
            </div>
          )}

          {/* STEP 3: 학급 코드 생성 완료 */}
          {step === 3 && (
            <div className="card-body px-4 py-5 px-sm-5 py-sm-5 text-center step-container">
              <div className="progress-bar-wrapper mb-5">
                <div className="progress-bar-fill" style={{ width: '100%' }}></div>
              </div>

              <div className="step-icon-wrapper mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>

              <h4 className="fw-bold signup-title mb-3">학급 코드 생성 완료</h4>
              <p className="signup-subtitle mb-4">
                학급이 개설되었어요.<br />
                생성된 학급 코드를 학부모님들께 공유해주세요.
              </p>

              <div className="class-code-box mb-3">
                <div className="class-code-school">{school} {grade}학년 {classNum}</div>
                <div className="class-code-value">{classCode}</div>
              </div>

              <button 
                className="btn btn-outline w-100 fw-bold mb-4 copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(classCode);
                  alert('클립보드에 복사되었습니다.');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                학급코드 복사하기
              </button>

              <button 
                className="btn w-100 fw-bold signup-btn active"
                onClick={() => navigate('/teacher/inbox')}
              >
                수신함으로 이동
              </button>
            </div>
          )}

        </div>

        {/* 하단 카피라이트 */}
        <div className="footer-text mt-4 text-center">
          © 2026, 소프티 All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default TeacherSignup;
