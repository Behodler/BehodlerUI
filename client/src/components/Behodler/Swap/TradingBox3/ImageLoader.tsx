import background from '../../../../images/new/behodler-swap-bg.jpg'
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

import pyroLINK from '../../../../images/pyroTokens/pyroLINK.png'
import pyroWETH from '../../../../images/pyroTokens/pyroWETH.png'
import pyroPNK from '../../../../images/pyroTokens/pyroPNK.png'
import pyroOXT from '../../../../images/pyroTokens/pyroOXT.png'
import pyroLOOM from '../../../../images/pyroTokens/pyroLOOM.png'


import pyroTokenLogo from '../../../../images/new/pyrotokens.png'
import pyroAnimated from '../../../../images/new/Fire-TransparentLow.gif'
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
        { baseToken: { image: Weth, name: "WETH" }, pyroToken: { image: pyroWETH, name: 'pyroWeth' } },
        { baseToken: { image: LINK, name: "LINK" }, pyroToken: { image: pyroLINK, name: 'pyroLINK' } },
        { baseToken: { image: LOOM, name: "LOOM" }, pyroToken: { image: pyroLOOM, name: 'pyroLOOM' } },
        { baseToken: { image: eyedai, name: "EYE/DAI UniV2LP" }, pyroToken: { image: pyroEYEDAI, name: 'PyroEYE/DAI UniV2LP' } },
        { baseToken: { image: scxeth, name: "SCX/ETH UniV2LP" }, pyroToken: { image: pyroScxeth, name: 'PyroSCX/ETH UniV2LP' } },
        { baseToken: { image: scxeye, name: "SCX/EYE UniV2LP" }, pyroToken: { image: pyroScxeye, name: 'PyroSCX/EYE UniV2LP' } },
        { baseToken: { image: Weth, name: "Weth" }, pyroToken: { image: pyroWETH, name: 'pyroWeth' } },
        { baseToken: { image: Weth, name: "MockWeth" }, pyroToken: { image: pyroWETH, name: 'pyroMockWeth' } },
        { baseToken: { image: eye, name: "MockToken1" }, pyroToken: { image: pyroEYEDAI, name: 'pyroMockToken1' } },
        { baseToken: { image: eye, name: "MockToken2" }, pyroToken: { image: pyroEYEDAI, name: 'pyroMockToken2' } },
        { baseToken: { image: eye, name: "MockToken3" }, pyroToken: { image: pyroEYEDAI, name: 'pyroMockToken3' } },
        { baseToken: { image: eye, name: "MockToken4" }, pyroToken: { image: pyroEYEDAI, name: 'pyroMockToken4' } },
    ]

export const Logos: ImageNamePair[] = [
    {
        name: "Pyrotoken",
        image: pyroTokenLogo
    },
    {
        name: "PyroAnimated",
        image: pyroAnimated
    },

    {
        name: "flippyArrows",
        image: flippyArrows
    },
    {
        name: "background",
        image: background
    }
]
