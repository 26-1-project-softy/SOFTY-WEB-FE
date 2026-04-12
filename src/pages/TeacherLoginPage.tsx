import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getKakaoLoginStartUrl } from '../services/api/auth';
import './TeacherLoginPage.css';

const TeacherLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    window.location.assign(getKakaoLoginStartUrl());
  };

  const KakaoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2 kakao-icon">
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.85 5.33 4.6 6.83l-1.2 4.3c-.1.35.3.65.6.45l5-3.3c.3.05.65.1 1 .1 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
    </svg>
  );

  return (
    <div className="teacher-login-container">
      <div className="login-wrapper">
        <div className="back-button" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        
        <div className="card login-card border-0 shadow-sm">
          <div className="card-body px-4 py-5 px-sm-5 py-sm-5 text-center">
            <h4 className="fw-bold mb-3 login-title">교사 로그인</h4>
            <p className="login-subtitle mb-5">소프티와 함께 안전한 학급 소통을 시작하세요.</p>
            
            <button className="btn btn-kakao-lg w-100" onClick={handleKakaoLogin}>
              <KakaoIcon /> 카카오로 시작하기
            </button>
          </div>
        </div>
        
        <div className="footer-text mt-4 text-center">
          © 2026, 소프티 All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
