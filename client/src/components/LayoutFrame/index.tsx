import React, { useCallback } from 'react'
import styled from 'styled-components'

import { BehodlerUIPyrotokens, pyrotokensBackgroundImage } from '../Behodler/Swap'
import useActiveWeb3React from '../Behodler/Swap/hooks/useActiveWeb3React'
import { injected } from '../../connectors'

const StyledHeaderContent = styled.div`
  align-items: center;
  border-bottom: 1px solid grey;
  color: #fff;
  display: flex;
  height: 96px;
  justify-content: flex-end;
  padding: 0 32px;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const StyledConnectButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid #9081d2;
  border-radius: 4px;
  color: #9081d2;
  display: flex;
  justify-content: center;
  font-size: 12px;
  padding: 6px 32px 4px;
  transition: all 0.2s ease;
  
  @media (max-width: 600px) {
    margin: 10px auto 0;
  }
  
  &:hover:not(:disabled) {
    background-color: #9081d2;
    color: #0d0523;
    cursor: pointer;
  }
  
  &:disabled {
    opacity: 0.4;
  }
`;

export default function LayoutFrame() {
    const { activate, account } = useActiveWeb3React()

    const connect = useCallback(async () => {
        try {
            const isAuthorized = await injected.isAuthorized()

            if (isAuthorized || (!isAuthorized && window.ethereum)) {
                await activate(injected, (e) => {
                    console.error('Unable to activate injected connector', e)
                })
            }
        } catch (e) {
            console.error('Failed connecting to a wallet', e)
        }
    }, [activate])

    return (
        <div style={{ background: `url(${pyrotokensBackgroundImage})` }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
            }}>

                <StyledHeaderContent>
                    {!account && (
                        <StyledConnectButton onClick={() => connect()}>
                            Connect
                        </StyledConnectButton>
                    )}
                </StyledHeaderContent>

                <div style={{ height: 'calc(100vh - 96px)' }}>
                    <BehodlerUIPyrotokens />
                </div>

            </div>
        </div >
    )
}
