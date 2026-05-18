export const RISK_LEVEL = {
  SAFE: 'SAFE',
  UNSAFE: 'UNSAFE',
} as const;

export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];

export const RISK_ANALYSIS_TITLE = {
  SAFE: '문제 없는 메시지예요',
  UNSAFE: '오해가 발생할 수 있는 메시지예요',
} satisfies Record<RiskLevel, string>;

export const RISK_ANALYSIS_DESCRIPTION = {
  SAFE: '현재 메시지는 차분하고 명확해요. 그대로 보내셔도 괜찮아요.',
  UNSAFE:
    '메시지의 의도와 다르게 받아들여질 가능성이 있어요. 더 부드럽고 명확한 문장으로 바꿔보는 것을 추천드려요.',
} satisfies Record<RiskLevel, string>;
