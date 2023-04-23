import background from '../../../../images/new/behodler-swap-bg.jpg'
import OXT from '../../../../images/behodler/oxt-logo.png'
import PNK from '../../../../images/behodler/pnk-logo.png'
import Weth from '../../../../images/behodler/eth-logo.png'
import LINK from '../../../../images/behodler/link-logo.png'
import LOOM from '../../../../images/behodler/loom-logo.png'

import eyedai from '../../../../images/behodler/eye-dai-logo.png'
import scxeth from '../../../../images/behodler/scx-eth-logo.png'
import scxeye from '../../../../images/behodler/scx-eye-logo.png'
import eye from '../../../../images/behodler_b.png'

import pyroEYEDAI from '../../../../images/pyroTokens/pyro-eye-dai.png'
import pyroScxeth from '../../../../images/pyroTokens/pyro-scx-eth.png'
import pyroScxeye from '../../../../images/pyroTokens/pyro-scx-eye.png'

import pyroLINK from '../../../../images/pyroTokens/pyro-link.png'
import pyroWETH from '../../../../images/pyroTokens/pyro-weth.png'
import pyroPNK from '../../../../images/pyroTokens/pyro-pnk.png'
import pyroOXT from '../../../../images/pyroTokens/pyro-oxt.png'
import pyroLOOM from '../../../../images/pyroTokens/pyro-loom.png'

import pyroTokenLogo from '../../../../images/new/pyrotokens.png'
import pyroAnimated from '../../../../images/new/Fire-TransparentLow.gif'
import flippyArrows from '../../../../images/new/flippyArrows.png'

interface ImageNamePair {
    image: string
    name: string
}

export interface ImagePair {
    baseToken: ImageNamePair,
    pyroToken: ImageNamePair,
}

export const TokenList: ImagePair[] =
    [
        {
            baseToken: { image: OXT, name: 'MKR' },//TODO: image for MKR and PyroMKR. Currently mainnt has no PyroMKR
            pyroToken: { image: pyroOXT, name: 'PyroMKR' },
        },
        {
            baseToken: { image: OXT, name: 'OXT' },
            pyroToken: { image: pyroOXT, name: 'PyroOXT' },
        },
        {
            baseToken: { image: PNK, name: 'PNK' },
            pyroToken: { image: pyroPNK, name: 'PyroPNK' },
        },
        {
            baseToken: { image: Weth, name: "ETH" },
            pyroToken: { image: pyroWETH, name: 'PyroWETH' },
        },
        {
            baseToken: { image: LINK, name: "LINK" },
            pyroToken: { image: pyroLINK, name: 'PyroLINK' },
        },
        {
            baseToken: { image: LOOM, name: "LOOM" },
            pyroToken: { image: pyroLOOM, name: 'PyroLOOM' },
        },
        {
            baseToken: { image: eyedai, name: "EYE/DAI UniV2" },
            pyroToken: { image: pyroEYEDAI, name: 'Pyro(EYE/DAI UniV2)' },
        },
        {
            baseToken: { image: scxeth, name: "SCX/ETH UniV2" },
            pyroToken: { image: pyroScxeth, name: 'Pyro (SCX/ETH UniV2)' },
        },
        {
            baseToken: { image: scxeye, name: "SCX/EYE UniV2" },
            pyroToken: { image: pyroScxeye, name: 'Pyro (SCX/EYE UniV2)' },
        },
        {
            baseToken: { image: eye, name: "MockToken1" },
            pyroToken: { image: pyroEYEDAI, name: 'PyroMockToken1' },
        },
        {
            baseToken: { image: eye, name: "MockToken2" },
            pyroToken: { image: pyroEYEDAI, name: 'PyroMockToken2' },
        },
        {
            baseToken: { image: eye, name: "MockToken3" },
            pyroToken: { image: pyroEYEDAI, name: 'PyroMockToken3' },
        },
        {
            baseToken: { image: eye, name: "MockToken4" },
            pyroToken: { image: pyroEYEDAI, name: 'PyroMockToken4' },
        },
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
