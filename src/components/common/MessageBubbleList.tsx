import styled from '@emotion/styled';
import { Avatar } from '@/components/common/Avatar';
import { IconBadge } from '@/components/common/IconBadge';
import { IcDefaultProfile } from '@/icons';
import { theme } from '@/styles/theme';
import { formatUserDisplayName, isUnknownUserDisplayName } from '@/utils/formatUserDisplayName';

export type MessageBubbleItem = {
  id: string | number;
  senderName: string;
  sentAt: string;
  content: string;
  isMine: boolean;
  isUnreadByCounterpart?: boolean;
};

type MessageBubbleListProps = {
  messages: MessageBubbleItem[];
  showUnreadMarker?: boolean;
};

export const MessageBubbleList = ({
  messages,
  showUnreadMarker = false,
}: MessageBubbleListProps) => {
  return (
    <>
      {messages.map(message => {
        const senderDisplayName = formatUserDisplayName(message.senderName);
        const isUnknownSender = isUnknownUserDisplayName(senderDisplayName);
        const messageContent = message.content || '-';
        const hasTrailingLineBreak = message.content.endsWith('\n');

        return (
          <MessageItem key={message.id} $isMine={message.isMine}>
            {!message.isMine ? (
              <CounterpartInfo>
                {isUnknownSender ? (
                  <IconBadge
                    size={36}
                    iconSize={18}
                    icon={IcDefaultProfile}
                    bgColor={theme.colors.background.bg4}
                    color={theme.colors.brand.dark}
                  />
                ) : (
                  <Avatar lastName={senderDisplayName.charAt(0)} />
                )}

                <SenderName>{senderDisplayName}</SenderName>
              </CounterpartInfo>
            ) : null}

            <BubbleWrap $isMine={message.isMine}>
              {showUnreadMarker && message.isMine && message.isUnreadByCounterpart ? (
                <UnreadMarker>1</UnreadMarker>
              ) : null}

              <MessageBubble $isMine={message.isMine}>
                {messageContent}
                {hasTrailingLineBreak ? <TrailingLineBreakMarker aria-hidden="true" /> : null}
              </MessageBubble>
            </BubbleWrap>

            <MessageTime $isMine={message.isMine}>{message.sentAt}</MessageTime>
          </MessageItem>
        );
      })}
    </>
  );
};

const MessageItem = styled.article<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 8px;
`;

const CounterpartInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SenderName = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const MessageTime = styled.span<{ $isMine: boolean }>`
  text-align: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const BubbleWrap = styled.div<{ $isMine: boolean }>`
  display: flex;
  align-items: flex-end;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  max-width: min(72%, 540px);
  gap: 8px;
`;

const UnreadMarker = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const MessageBubble = styled.div<{ $isMine: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  white-space: break-spaces;
  overflow-wrap: anywhere;
  border-radius: ${({ $isMine }) => ($isMine ? '20px 0' : '0 20px')} 20px 20px;
  padding: 12px 16px;
  color: ${({ $isMine, theme }) => ($isMine ? theme.colors.text.textW : theme.colors.text.text2)};
  background: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.brand.primary : theme.colors.background.bg1};
`;

const TrailingLineBreakMarker = styled.span`
  &::after {
    content: '\\00a0';
  }
`;
