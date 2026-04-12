import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { kakaoCallbackApi } from '../services/api/auth';
import './TeacherKakaoCallbackPage.css';

const TeacherKakaoCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    document.title = '카카오 로그인 처리 중 - 소프티';
  }, []);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const code = searchParams.get('code') || hashParams.get('code');
    const state = searchParams.get('state') || hashParams.get('state') || undefined;
    const error = searchParams.get('error') || hashParams.get('error');
    const queryAccessToken = searchParams.get('accessToken') || hashParams.get('accessToken');
    const queryRefreshToken = searchParams.get('refreshToken') || hashParams.get('refreshToken');
    const registrationRequiredRaw =
      searchParams.get('registrationRequired') || hashParams.get('registrationRequired');

    const finalizeLogin = (accessToken: string, refreshToken?: string, registrationRequired = false) => {
      localStorage.setItem('accessToken', accessToken);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      window.history.replaceState({}, document.title, '/teacher/login/callback');

      if (registrationRequired) {
        localStorage.setItem('pendingKakaoAccessToken', accessToken);
        navigate('/signup', { replace: true });
        return;
      }

      localStorage.removeItem('pendingKakaoAccessToken');
      navigate('/teacher/inbox', { replace: true });
    };

    const processCallback = async () => {
      if (error) {
        setErrorMessage(`카카오 로그인에 실패했습니다. (${error})`);
        return;
      }

      if (queryAccessToken) {
        finalizeLogin(queryAccessToken, queryRefreshToken || undefined, registrationRequiredRaw === 'true');
        return;
      }

      if (!code) {
        setErrorMessage('인가 코드와 로그인 토큰이 없어 로그인 결과를 확인할 수 없습니다.');
        return;
      }

      try {
        const result = await kakaoCallbackApi({ code, state, error: undefined });

        if (!result.accessToken) {
          setErrorMessage('로그인 토큰을 받지 못했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }

        finalizeLogin(result.accessToken, result.refreshToken, result.registrationRequired);
      } catch (e) {
        console.error('카카오 콜백 처리 실패:', e);
        setErrorMessage('로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    };

    void processCallback();
  }, [navigate, searchParams]);

  if (errorMessage) {
    return (
      <div className="kakao-callback-container">
        <div className="kakao-callback-card">
          <h1 className="kakao-callback-title">로그인을 완료하지 못했어요</h1>
          <p className="kakao-callback-message">{errorMessage}</p>
          <button className="kakao-callback-button" onClick={() => navigate('/teacher/login')}>
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kakao-callback-container">
      <div className="kakao-callback-card">
        <h1 className="kakao-callback-title">카카오 로그인 처리 중</h1>
        <p className="kakao-callback-message">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
};

export default TeacherKakaoCallbackPage;
