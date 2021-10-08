import * as React from 'react'
import { BehodlerUIPyrotokens, pyrotokensBackgroundImage } from '../Behodler/Swap'

export default function LayoutFrame() {
    return (
        <div style={{ background: `url(${pyrotokensBackgroundImage})` }}>
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

                <BehodlerUIPyrotokens />

            </div>
        </div >
    )
}
