import '@reach/dialog/styles.css'
import React from 'react'
import {DialogContent, DialogOverlay} from '@reach/dialog'
import {transparentize} from 'polished'
import {isMobile} from 'react-device-detect'
import {animated, useSpring, useTransition} from 'react-spring'
import {useGesture} from 'react-use-gesture'
import styled, {css} from 'styled-components'

import { ReactComponent as CloseIcon } from './close.svg'

import {
    StyledModalContent,
    StyledModalP,
    StyledModalHeader,
} from './styled'

const AnimatedDialogOverlay = animated(DialogOverlay)

const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 10;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, .425);
  }
`

const AnimatedDialogContent = animated(DialogContent)

const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
    <AnimatedDialogContent {...rest} />
)).attrs({
    'aria-label': 'dialog'
})`
  overflow-y: ${({mobile}) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background-color: rgb(22, 21, 34);
    box-shadow: 0 4px 8px 0 ${transparentize(0.95, '#000')};
    padding: 0;
    width: 50vw;
    overflow-x: hidden;
    max-width: 420px;
    display: flex;
    border-radius: 10px;
    
    overflow-y: ${({mobile}) => (mobile ? 'scroll' : 'hidden')};
    align-self: ${({mobile}) => (mobile ? 'flex-end' : 'center')};

    ${({ maxHeight }) => (
        maxHeight && css`
        max-height: ${maxHeight}vh;
      `
    )}

    ${({ minHeight }) => (
        minHeight && css`
        min-height: ${minHeight}vh;
      `
    )}

    @media (max-width: 960px) {
      width: 65vw;
      margin: 0;
    }
    
    @media (max-width: 720px) {
      width: 85vw;
      margin: 0;

      ${({ mobile }) => (
        mobile && css`
          width: 100vw;
          border-radius: 10px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `
      )}
    }
  }
`

const StyledModalWrapper = styled.div`
  background-image: linear-gradient(to right, #3e236c, #9081d2, #3e236c);
  border-radius: 8px;
  padding: 1px;
  width: 100%;
`

const StyledModalContentWrapper = styled.div`
  background-color: #000;
  border-radius: 8px;
  color: #dedede;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  position: relative;
  width: 100%;
  
  ${({ noPadding }) => (
    noPadding && `
      padding: 0;
    `
  )}
`

const StyledModalCloseButton = styled(CloseIcon)`
  color: #dedede;
  position: absolute;
  right: 16px;
  top: 12px;
  width: 24px;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

interface ModalProps {
    isOpen: boolean
    onDismiss: () => void
    minHeight?: number | false
    maxHeight?: number
    initialFocusRef?: React.RefObject<any>
    children?: React.ReactNode
    noPadding?: boolean
    noCloseButton?: boolean
}

export default function Modal({
                                  isOpen,
                                  onDismiss,
                                  minHeight = false,
                                  maxHeight = 90,
                                  initialFocusRef,
                                  children,
                                  noPadding = false,
                                  noCloseButton = false,
                              }: ModalProps) {
    const fadeTransition = useTransition(isOpen, null, {
        config: {duration: 200},
        from: {opacity: 0},
        enter: {opacity: 1},
        leave: {opacity: 0}
    })

    const [{y}, set] = useSpring(() => ({
        y: 0,
        config: {mass: 1, tension: 210, friction: 20}
    }))
    const bind = useGesture({
        onDrag: state => {
            set({
                y: state.down ? state.movement[1] : 0
            })
            if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
                onDismiss()
            }
        }
    })

    return (
        <>
            {fadeTransition.map(
                ({item, key, props}) =>
                    item && (
                        <StyledDialogOverlay
                            key={key}
                            style={props}
                            onDismiss={onDismiss}
                            initialFocusRef={initialFocusRef}
                        >
                            <StyledDialogContent
                                {...(isMobile
                                    ? {
                                        ...bind(),
                                        style: {
                                            transform: y.interpolate(y => `translateY(${y > 0 ? y : 0}px)`)
                                        }
                                    }
                                    : {})}
                                aria-label="dialog content"
                                minHeight={minHeight}
                                maxHeight={maxHeight}
                                mobile={isMobile}
                            >
                                <StyledModalWrapper>
                                    <StyledModalContentWrapper noPadding={noPadding}>
                                        {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                                        {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                                        {!noCloseButton && <StyledModalCloseButton onClick={onDismiss} />}
                                        {children}
                                    </StyledModalContentWrapper>
                                </StyledModalWrapper>
                            </StyledDialogContent>
                        </StyledDialogOverlay>
                    )
            )}
        </>
    )
}

export {
    StyledModalContent,
    StyledModalP,
    StyledModalHeader,
}
