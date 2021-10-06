import * as React from 'react'
import { BehodlerUIPyrotokens, pyrotokensBackgroundImage } from '../Behodler/Swap'

export default function LayoutFrame() {
    return (
        <div style={{ background: `url(${pyrotokensBackgroundImage})` }}>
            <BehodlerUIPyrotokens />
        </div >
    )
}
