import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { adminLoginApi } from '../../services/api/auth';

const AdminLogin: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 기본 클라이언트단 유효성 검사
    if (!loginId.trim() || !password.trim()) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    // [프론트엔드 UI 테스트용 임시 우회 (서버 연결 없이 대시보드 진입)]
    if (loginId === 'test' && password === 'test') {
      localStorage.setItem('accessToken', 'dummy-access-token');
      localStorage.setItem('refreshToken', 'dummy-refresh-token');
      navigate('/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      // API 명세서에 맞춘 호출 진행
      const response = await adminLoginApi(loginId, password);
      
      // 명세서의 success 필드 확인
      if (response.success) {
        alert(response.message || '관리자 로그인에 성공했습니다.');
        
        // 받아온 accessToken, refreshToken 저장 (보통 localStorage나 sessionStorage, 전역 상태 활용)
        if (response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // 3. 페이지 이동
        navigate('/dashboard');
      } else {
        setIsError(true);
      }
    } catch (error: any) {
      console.error('로그인 API 호출 에러:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-wrapper">
        {/* 뒤로가기 아이콘 (왼쪽 상단) */}
        <div className="back-button" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        
        {/* 로그인 카드 */}
        <div className="card login-card border-0 shadow-sm">
          <div className="card-body px-4 py-5 px-sm-5 py-sm-5">
            <h4 className="text-center fw-bold mb-5 login-title">관리자 로그인</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="adminId" className="form-label fw-bold login-label">아이디</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  id="adminId" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="아이디를 입력해주세요." 
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="adminPw" className="form-label fw-bold login-label">비밀번호</label>
                <input 
                  type="password" 
                  className="form-control login-input" 
                  id="adminPw" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요." 
                />
              </div>
              
              {isError && (
                <div className="error-box">
                  <div className="error-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div>
                    <div className="error-text-main">아이디 또는 비밀번호가 올바르지 않아요</div>
                    <div className="error-text-sub">입력한 정보를 다시 확인해 주세요.</div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-light w-100 fw-bold login-btn"
                disabled={isLoading}
              >
                {isLoading ? '로딩 중...' : '로그인'}
              </button>
            </form>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="footer-text mt-4 text-center">
          © 2026, 소프티 All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
