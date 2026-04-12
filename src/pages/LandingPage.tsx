import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "소프티 - 더 안전한 학급 소통 공간";
  }, []);

  const handleKakaoLogin = () => {
    navigate("/teacher/login");
  };

  const KakaoIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="me-2 kakao-icon"
    >
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.85 5.33 4.6 6.83l-1.2 4.3c-.1.35.3.65.6.45l5-3.3c.3.05.65.1 1 .1 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-logo" onClick={() => navigate("/")}>
          <span className="logo-text">소프티</span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline-admin"
            onClick={() => navigate("/admin")}
          >
            관리자 로그인
          </button>
          <button className="btn btn-kakao" onClick={handleKakaoLogin}>
            <KakaoIcon /> 카카오로 로그인
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content text-left">
            <h1 className="hero-title">
              선생님과 학부모를 잇는
              <br />더 안전한 학급 소통 공간,{" "}
              <span className="hero-highlight">소프티</span>
            </h1>
            <p className="hero-subtitle">
              학부모와 비동기로 소통하고,
              <br />
              AI로 분쟁 위험을 점검하고,
              <br />
              대화 내역은 PDF로 저장해보세요.
              <br />
              소프티와 함께라면 안심하고 소통할 수 있어요.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-kakao-lg" onClick={handleKakaoLogin}>
                <KakaoIcon /> 카카오로 로그인
              </button>
              <button
                className="btn btn-white-lg"
                onClick={() =>
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: "smooth",
                  })
                }
              >
                서비스 둘러보기
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section white-section">
        <div className="feature-inner split-layout">
          <div className="feature-text text-left">
            <p className="feature-label">가입</p>
            <h2 className="feature-title">
              학급 생성부터 참여까지
              <br />
              간편하게
            </h2>
            <p className="feature-desc">
              교사는 학급을 개설하고,
              <br />
              학부모는 학급 코드를 입력해
              <br />
              간단한 절차로 소통을 시작할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      <section className="feature-section light-section text-left">
        <div className="feature-inner">
          <div className="feature-header mb-5 text-left">
            <p className="feature-label">수신함·채팅응답</p>
            <h2 className="feature-title">
              문의 의도 파악은 빠르게
              <br />
              답장은 더 신중하게
            </h2>
          </div>

          <div className="feature-zigzag">
            <div className="zigzag-row">
              <div className="zigzag-text">
                <h3 className="grid-item-title">
                  문의 의도를
                  <br />
                  한눈에 파악할 수 있어요
                </h3>
                <p className="grid-item-desc">
                  AI가 학부모 문의의 의도 태그를 먼저 제안하고,
                  <br />
                  필요한 경우 학부모가 태그를 수정해 메시지를 전송해요.
                  <br />
                  수신함과 채팅방에서 문의 유형을 빠르게 파악할 수 있어요.
                </p>
              </div>
            </div>

            <div className="zigzag-row reverse mt-5">
              <div className="zigzag-text">
                <h3 className="grid-item-title">
                  보내기 전 한 번 더,
                  <br />
                  답장을 더 신중하게 점검하세요
                </h3>
                <p className="grid-item-desc">
                  교사가 답장을 작성하면 AI가 분쟁 가능성을 점검해줘요.
                  <br />
                  분쟁 가능성이 있는 경우 AI가 추천 메시지를 제안해
                  <br />더 신중하게 답장을 작성할 수 있도록 도와줘요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section gray-section text-left">
        <div className="feature-inner">
          <div className="feature-header mb-5 text-left">
            <p className="feature-label">증빙 리포트</p>
            <h2 className="feature-title">
              대화 내역,
              <br />
              간편하게 내려받을 수 있도록
            </h2>
          </div>

          <div className="report-layout text-left">
            <p className="feature-desc">
              원하는 대화를 선택하고 미리보기로 확인할 수 있어요.
              <br />
              별도 정리 없이 대화 내용을 그대로 PDF로 내려받을 수 있어요.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section text-center">
        <div className="cta-inner">
          <h2 className="cta-title">
            학급 소통을 더 간편하고 안전하게
            <br />
            소프티에서 시작해보세요
          </h2>
          <p className="cta-subtitle">
            선생님과 학부모를 잇는 학급 소통,
            <br />
            이제 더 명확하고 안전하게 관리해보세요.
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-kakao-lg mx-auto"
              onClick={handleKakaoLogin}
            >
              <KakaoIcon /> 카카오로 로그인
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer text-center">
        © 2026, 소프티 All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
