import * as React from 'react'
import {BehodlerUISwap, swapBackgroundImage} from '../Behodler/Swap'

export default function LayoutFrame() {
    return ( // simulate UI container layout
        <div style={{ background: `url(${swapBackgroundImage})` }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
            }}>

                <div style={{
                    alignItems: 'center',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    height: '96px',
                    borderBottom: '1px solid grey',
                }}>
                    Header
                </div>

                <BehodlerUISwap />

            </div>
        </div >
    )
}
