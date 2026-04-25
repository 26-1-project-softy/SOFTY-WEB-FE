import {
  ImgHero,
  ImgSignupTeacher,
  ImgSignupParent,
  ImgIntentTag,
  ImgRiskAnalysis,
  ImgReport,
} from '@/images';

export type LandingActionVariant = 'primary' | 'ghost' | 'kakao';
export type LandingActionType = 'teacherLogin' | 'openParentAppInstallDialog' | 'scrollToFeature';

export type LandingAction = {
  key: string;
  label: string;
  variant: LandingActionVariant;
  actionType: LandingActionType;
};

export type LandingImage = {
  src: string;
  alt: string;
};

export type LandingTextBlock = {
  title: string[];
  description: string[];
};

export type LandingFeatureBlock = LandingTextBlock & {
  image: LandingImage;
  isImageLeft?: boolean;
};

export type LandingContent = {
  hero: LandingTextBlock & {
    highlightText: string;
    image: LandingImage;
    actions: LandingAction[];
  };
  signup: {
    featureLabel: string;
    title: string[];
    description: string[];
    images: {
      teacher: LandingImage;
      parent: LandingImage;
    };
  };
  aiAnalysis: {
    featureLabel: string;
    title: string[];
    blocks: LandingFeatureBlock[];
  };
  report: {
    featureLabel: string;
    title: string[];
    leftDescription: string[];
    rightDescription: string[];
    image: LandingImage;
  };
  cta: LandingTextBlock & {
    actions: LandingAction[];
  };
};

export const landingContent: LandingContent = {
  hero: {
    title: ['선생님과 학부모를 잇는', '더 안전한 학급 소통 공간,'],
    highlightText: '소프티',
    description: [
      '학부모와 비동기로 소통하고,',
      'AI로 분쟁 위험을 점검하고,',
      '대화 내역은 PDF로 저장해보세요.',
      '소프티와 함께라면 안심하고 소통할 수 있어요.',
    ],
    image: {
      src: ImgHero,
      alt: '소프티 메인 소개 이미지',
    },
    actions: [
      {
        key: 'teacher-login',
        label: '카카오로 교사 로그인',
        variant: 'kakao',
        actionType: 'teacherLogin',
      },
      {
        key: 'download-parent-app',
        label: '학부모 앱 설치하기',
        variant: 'primary',
        actionType: 'openParentAppInstallDialog',
      },
      {
        key: 'scroll-to-feature',
        label: '서비스 둘러보기',
        variant: 'ghost',
        actionType: 'scrollToFeature',
      },
    ],
  },
  signup: {
    featureLabel: '가입',
    title: ['학급 생성부터 참여까지', '간편하게'],
    description: [
      '교사는 학급을 개설하고,',
      '학부모는 학급 코드를 입력해',
      '간단한 절차로 소통을 시작할 수 있어요.',
    ],
    images: {
      teacher: {
        src: ImgSignupTeacher,
        alt: '교사 학급 코드 생성 화면',
      },
      parent: {
        src: ImgSignupParent,
        alt: '학부모 학급 참여 화면',
      },
    },
  },
  aiAnalysis: {
    featureLabel: '수신함·채팅방',
    title: ['문의 의도 파악은 빠르게,', '답장은 더 신중하게'],
    blocks: [
      {
        title: ['문의 의도를', '한눈에 파악할 수 있어요'],
        description: [
          'AI가 학부모 문의에 의도 태그를 먼저 제안하고,',
          '필요한 경우 학부모가 태그를 수정해 메시지를 전송해요.',
          '수신함과 채팅방에서 문의 유형을 빠르게 파악할 수 있어요.',
        ],
        image: {
          src: ImgIntentTag,
          alt: 'AI 의도 분석과 의도 태그 화면',
        },
      },
      {
        title: ['보내기 전 한 번 더,', '답장을 더 신중하게 점검하세요'],
        description: [
          '교사가 답장을 작성하면 AI가 분쟁 가능성을 점검해줘요.',
          '분쟁 가능성이 있는 경우 AI가 추천 메시지를 제안해',
          '더 신중하게 답장을 작성할 수 있도록 도와줘요.',
        ],
        image: {
          src: ImgRiskAnalysis,
          alt: 'AI 분쟁 가능성 분석 화면',
        },
        isImageLeft: true,
      },
    ],
  },
  report: {
    featureLabel: '증빙 리포트',
    title: ['대화 내역,', '간편하게 내려받을 수 있도록'],
    leftDescription: ['원하는 대화를 선택하고', '미리보기로 확인할 수 있어요'],
    rightDescription: ['별도 정리 없이', '대화 내용을 그대로 PDF로', '내려받을 수 있어요'],
    image: {
      src: ImgReport,
      alt: '대화 내역 PDF 리포트 화면',
    },
  },
  cta: {
    title: ['학급 소통을 더 간편하고 안전하게', '소프티에서 시작해보세요'],
    description: ['선생님과 학부모를 잇는 학급 소통,', '이제 더 명확하고 편안하게 관리해보세요.'],
    actions: [
      {
        key: 'cta-teacher-login',
        label: '카카오로 교사 로그인',
        variant: 'kakao',
        actionType: 'teacherLogin',
      },
      {
        key: 'cta-download-parent-app',
        label: '학부모 앱 설치하기',
        variant: 'primary',
        actionType: 'openParentAppInstallDialog',
      },
    ],
  },
};

export const EXTERNAL_LINKS = {
  parentAppDistribution:
    'https://expo.dev/accounts/choijiyoon/projects/softy-parent/builds/0ce0bac3-f3b0-4594-97db-35e605c112c7',
} as const;
