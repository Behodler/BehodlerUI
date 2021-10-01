import OXT from '../../../../images/behodler/1.png'
import PNK from '../../../../images/behodler/2.png'
import Weth from '../../../../images/behodler/3.png'
import LINK from '../../../../images/behodler/4.png'
import LOOM from '../../../../images/behodler/6.png'




import eyedai from '../../../../images/behodler/eyedai.png'
import scxeth from '../../../../images/behodler/scxeth.png'
import scxeye from '../../../../images/behodler/scxeye.png'
import eye from '../../../../images/behodler_b.png'

import pyroEYEDAI from '../../../../images/pyroTokens/pyroEYE-DAI.png'
import pyroScxeth from '../../../../images/pyroTokens/pyroScx-eth.png'
import pyroScxeye from '../../../../images/pyroTokens/pyroScx-eye.png'

import pyroLINK from '../../../../images/ppyroScx-eyeyroTokens/pyroLINK.png'
import pyroWETH from '../../../../images/pyroTokens/pyroWETH.png'
import pyroPNK from '../../../../images/pyroTokens/pyroPNK.png'
import pyroOXT from '../../../../images/pyroTokens/pyroOXT.png'
import pyroLOOM from '../../../../images/pyroTokens/pyroLOOM.png'


import pyroTokenLogo from '../../../../images/pyroTokens/pyrotokens.png'
import flippyArrows from '../../../../images/new/flippyArrows.png'

interface ImageNamePair {
    image: string
    name: string
}

interface ImagePair {
    baseToken: ImageNamePair,
    pyroToken: ImageNamePair,
}

export const TokenList: ImagePair[] =
    [
        { baseToken: { image: OXT, name: 'OXT' }, pyroToken: { image: pyroOXT, name: 'pyroOXT' } },
        { baseToken: { image: PNK, name: 'PNK' }, pyroToken: { image: pyroPNK, name: 'pyroPNK' } },
        {baseToken: {image:Weth,name:"WETH"}, pyroToken: {image:pyroWETH,name:'pyroWeth'}},
        {baseToken: {image: LINK,name: "LINK"}, pyroToken:{image:pyroLINK,name:'pyroLINK'}},
        {baseToken: {image:LOOM,name:"LOOM"}, pyroToken: {image:pyroLOOM,name:'pyroLOOM'}},
        {baseToken: {image:eyedai,name:"EYE/DAI"}, pyroToken: {image:pyroEYEDAI,name:'pyroEYEDAI'}},
        {baseToken: {image:scxeth,name:"SCX/ETH"}, pyroToken: {image:pyroScxeth,name:'pyroScxeth'}},
        {baseToken: {image:scxeye,name:"SCX/EYE"}, pyroToken: {image:pyroScxeye,name:'pyroScxeye'}},
        {baseToken: {image:eye,name:"EYE"}, pyroToken: {image:pyroEYEDAI,name:'pyroEYEDAI'}}
    ]

    export const Logos: ImageNamePair[] = [
        {
            name:"Pyrotoken",
            image:pyroTokenLogo
        },
        {
            name:"flippyArrows",
            image:flippyArrows
        }
    ]