import * as React from 'react'
import {BehodlerUISwap, swapBackgroundImage} from '../Behodler/Swap'

export default function LayoutFrame() {
    return (
        <div style={{ background: `url(${swapBackgroundImage})` }}>
            <BehodlerUISwap />
        </div >
    )
}
