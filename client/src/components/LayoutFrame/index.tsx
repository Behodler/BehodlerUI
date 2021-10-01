import * as React from 'react'
// import Swap from '../Behodler/Swap/index'
import {BehodlerUISwap, swapBackgroundImage} from '../BehodlerUISwap'


export default function LayoutFrame(props: {}) {


    return (
        <div style={{ background: `url(${swapBackgroundImage})` }}>
            <BehodlerUISwap />
        </div >
    )
}
