import styled, { css } from 'styled-components';

import {
  borderSize,
  userIndicatorsOffset,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  lineHeightComputed,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';

import {
  colorWhite,
  userListBg,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';

interface ChatWrapperProps {
  sameSender: boolean;
}

interface ChatContentProps {
  sameSender: boolean;
}

interface ChatAvatarProps {
  avatar: string;
  color: string;
  moderator: boolean;
  emoji?: string;
}

export const ChatWrapper = styled.div<ChatWrapperProps>`
  pointer-events: auto;
  [dir='rtl'] & {
    direction: rtl;
  }
  display: flex;
  flex-flow: row;
  position: relative;
  ${({ sameSender }) => sameSender && `
    flex: 1;
    margin: ${borderSize} 0 0 ${borderSize};
    margin-top: calc(${lineHeightComputed} / 3);
  `}
  ${({ sameSender }) => !sameSender && `
    padding-top:${lineHeightComputed};
  `}
  [dir="rtl"] & {
    margin: ${borderSize} ${borderSize} 0 0;
  }
  font-size: ${fontSizeBase};
`;

export const ChatContent = styled.div<ChatContentProps>`
  display: flex;
  flex-flow: column;
  width: 100%;

  ${({ sameSender }) => sameSender && `
    margin-left: 2.6rem;
  `}
`;

export const ChatAvatar = styled.div<ChatAvatarProps>`
  flex: 0 0 2.25rem;
  margin: 0px calc(0.5rem) 0px 0px;
  box-flex: 0;
  position: relative;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  ${({ color }) => css`
    background-color: ${color};
  `}
  }

  &:after,
  &:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    padding-top: .5rem;
    padding-right: 0;
    padding-left: 0;
    padding-bottom: 0;
    color: inherit;
    top: auto;
    left: auto;
    bottom: ${userIndicatorsOffset};
    right: ${userIndicatorsOffset};
    border: 1.5px solid ${userListBg};
    border-radius: 50%;
    background-color: ${colorSuccess};
    color: ${colorWhite};
    opacity: 0;
    font-family: 'bbb-icons';
    font-size: .65rem;
    line-height: 0;
    text-align: center;
    vertical-align: middle;
    letter-spacing: -.65rem;
    z-index: 1;

    [dir="rtl"] & {
      left: ${userIndicatorsOffset};
      right: auto;
      padding-right: .65rem;
      padding-left: 0;
    }
  }

  ${({ moderator }) => moderator && `
    border-radius: 5px;
  `}

  // ================ image ================
  ${({ avatar, emoji }) => avatar?.length !== 0 && !emoji && css`
      background-image: url(${avatar});
      background-repeat: no-repeat;
      background-size: contain;
    `}
  // ================ image ================

  // ================ content ================
  color: ${colorWhite};
  font-size: 110%;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items:center;
  // ================ content ================

  & .react-loading-skeleton {
    height: 2.25rem;
    width: 2.25rem;
  }
`;
