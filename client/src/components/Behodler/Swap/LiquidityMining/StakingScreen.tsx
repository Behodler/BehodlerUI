import * as React from 'react'
import { useEffect, useState, useContext, useCallback } from 'react'
import Token from '../../../../blockchain/observables/Token'
import { createStyles, Grid, makeStyles, Box } from '@material-ui/core'

import API from "../../../../blockchain/ethereumAPI"
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import { formatSignificantDecimalPlaces } from '../../../../util/jsHelpers'
import BigNumber from 'bignumber.js';


const useStakeStyles = makeStyles(theme => createStyles({
    poolLink: {
        fontWeight: "bold",
        '&:hover': {
            textDecoration: 'none'
        }
    },
    blurb: {
        maxWidth: 600,
        textAlign: "center",
        lineHeight: 1.6
    },
    margin: {
        margin: theme.spacing(1),
    },
    disabledButton: {
        margin: theme.spacing(1),
        backgroundColor: 'grey'
    },
    uniImage: {
        marginLeft: 10,
        maxWidth: 30
    },
    boldGridItem: {
        fontWeight: 'bold',
        minHeight: 20,
        color: 'darkgray',
        fontSize: '0.75em'
    }, blurbTitle: {
        fontSize: '1.05em'
    }, blurbBody: {
        fontSize: '0.85em'
    }, blurbDisclaimer: {
        fontSize: '0.75em',
        fontWeight: 'bold',
        color: 'darkorchid'
    }
}))

enum StakeButtonState {
    Unset,
    RequirementSet,
    NotApproved,
    Approving,
    Approved,
    BalanceTooLow,
    BalanceHighEnough,
    Staked
}
export default function StakingScreen() {
    const classes = useStakeStyles()
    const walletContextProps = useContext(WalletContext)
    const Sluice = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate.address
    const [scxEyeRequired, setScxEyeRequired] = useState<string>('')
    const [eyeEthRequired, setEyeEthRequired] = useState<string>('')
    const [scxEyeButtonState, setScxEyeButtonState] = useState<StakeButtonState>(StakeButtonState.Unset)
    const [eyeEthButtonState, setEyeEthButtonState] = useState<StakeButtonState>(StakeButtonState.Unset)
    const [eyeSCXEffect, setEyeSCXEffect] = useState<Token | null>()
    const [eyeETHEffect, setEyeETHEffect] = useState<Token | null>()
    const [eyeSCXApproveClicked, setEyeSCXApproveClicked] = useState<boolean>(false)
    const [eyeEthApproveClicked, setEyeEthApproveClicked] = useState<boolean>(false)
    const [stakeSCXClicked, setStakeSCXClicked] = useState<boolean>(false)
    const [stakeEYEClicked, setStakeEYEClicked] = useState<boolean>(false)

    const pairEffectCallback = useCallback(async () => {

        setEyeSCXEffect(await API.EYE_SCXEffects(walletContextProps.networkName, walletContextProps.account))
        setEyeETHEffect(await API.EYE_ETHEffects(walletContextProps.networkName, walletContextProps.account))

    }, [])


    useEffect(() => { pairEffectCallback() }, [])

    useEffect(() => {
        if (eyeETHEffect && !isNaN(parseFloat(eyeEthRequired))) {
            const effect = eyeETHEffect.allowance(walletContextProps.account, Sluice)
            const subscription = effect.Observable.subscribe(all => {
                if (new BigNumber(API.toWei(eyeEthRequired)).lte(new BigNumber(all.toString()))) {
                    setEyeEthButtonState(StakeButtonState.Approved)
                }
            })

            return () => { subscription.unsubscribe(); }
        }
        return () => { }
    }, [eyeETHEffect, eyeEthRequired])

    useEffect(() => {
        if (eyeSCXEffect && !isNaN(parseFloat(scxEyeRequired))) {
            const effect = eyeSCXEffect.allowance(walletContextProps.account, Sluice)
            const subscription = effect.Observable.subscribe(all => {
                if (new BigNumber(API.toWei(scxEyeRequired)).lte(new BigNumber(all.toString()))) {
                    setScxEyeButtonState(StakeButtonState.Approved)
                }
            })

            return () => { subscription.unsubscribe(); }
        }
        return () => { }
    }, [eyeSCXEffect, scxEyeRequired])


    //Figure out how much of each LP required
    useEffect(() => {
        if (eyeEthButtonState === StakeButtonState.Unset) {
            const eyeEffect = API.eyeWethLPEffects.impliedProportionLPUnitsAbsoluteToken1('1000')
            const subscription = eyeEffect.Observable.subscribe(ethEye => {
                setEyeEthRequired(formatSignificantDecimalPlaces(ethEye, 2))
                setEyeEthButtonState(StakeButtonState.RequirementSet)
            })
            return () => { subscription.unsubscribe() }
        }

        if (scxEyeButtonState === StakeButtonState.Unset) {
            const scxEffect = API.scxEyeLPEffects.impliedProportionLPUnitsPercentage("10")
            const subscription = scxEffect.Observable.subscribe(scxEYE => {
                setScxEyeRequired(formatSignificantDecimalPlaces(scxEYE, 2))
                setScxEyeButtonState(StakeButtonState.RequirementSet)
            })

            return () => { subscription.unsubscribe() }
        }
        return () => { }
    }, [walletContextProps.account, scxEyeButtonState, eyeEthButtonState])

    //Establish whether balance high enough
    useEffect(() => {
        if (scxEyeButtonState === StakeButtonState.Approved && eyeSCXEffect) {
            const effect = eyeSCXEffect.balanceOfTokenEffect(walletContextProps.account)
            const subscription = effect.Observable.subscribe(balance => {
                setScxEyeButtonState(balance === '0' ? StakeButtonState.BalanceTooLow : StakeButtonState.BalanceHighEnough)

            })
            return () => {
                subscription.unsubscribe();
            }
        }

        if (eyeEthButtonState === StakeButtonState.Approved && eyeETHEffect) {
            const effect = eyeETHEffect.balanceOfEffect(walletContextProps.account)
            const subscription = effect.Observable.subscribe(balance => {
                const balWei = new BigNumber(balance)
                const reqWei = new BigNumber(eyeEthRequired)
                setEyeEthButtonState(balWei.lt(reqWei) ? StakeButtonState.BalanceTooLow : StakeButtonState.BalanceHighEnough)
            })
            return () => {
                subscription.unsubscribe();
            }
        }
        return () => { }
    }, [scxEyeButtonState, eyeEthButtonState, eyeSCXEffect, eyeETHEffect])


    const eyeSCXApproveClickedCallback = useCallback(async () => {
        if (eyeSCXApproveClicked) {
            const pairAddress = await API.EYE_SCX_PAIR(walletContextProps.networkName, walletContextProps.account)
            const token = await API.getToken(pairAddress, walletContextProps.networkName)
            const Sluice = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate.address
            token.approve(Sluice, API.UINTMAX).send({ from: walletContextProps.account }, () => {

            }).on('receipt', function () {
                setScxEyeButtonState(StakeButtonState.Approved)
            }).on('confirmation', function (confirmationNumber, receipt) {
            })
            setEyeSCXApproveClicked(false)
        }
    }, [eyeSCXApproveClicked])


    useEffect(() => {
        eyeSCXApproveClickedCallback()
    }, [eyeSCXApproveClicked])

    const eyeETHApproveClickedCallback = useCallback(async () => {
        if (eyeEthApproveClicked) {
            const pairAddress = await API.EYE_ETH_PAIR(walletContextProps.networkName, walletContextProps.account)
            const token = await API.getToken(pairAddress, walletContextProps.networkName)
            const Sluice = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate.address
            token.approve(Sluice, API.UINTMAX).send({ from: walletContextProps.account }, () => {
                setEyeEthButtonState(StakeButtonState.Approving)
            }).on('receipt', function () {
                setEyeEthButtonState(StakeButtonState.Approved)
            }).on('confirmation', function (confirmationNumber, receipt) {

            })
            setEyeEthApproveClicked(false)
        }
    }, [eyeEthApproveClicked])


    useEffect(() => {
        eyeETHApproveClickedCallback()
    }, [eyeEthApproveClicked])

    const scxClickedCallback = useCallback(async () => {
        if (stakeSCXClicked) {
            const EYE_SCX = await API.EYE_SCX_PAIR(walletContextProps.networkName, walletContextProps.account)
            walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate
                .betaApply(EYE_SCX)
                .send({ from: walletContextProps.account })
                .on('receipt', function () {
                    alert('received')
                    setScxEyeButtonState(StakeButtonState.Staked)
                }).on('confirmation', function (confirmationNumber, receipt) {
                    console.log('confirming: ' + confirmationNumber)
                })
            setStakeSCXClicked(false)
        }
    }, [stakeSCXClicked])

    useEffect(() => { scxClickedCallback() }, [stakeSCXClicked])

    const eyeClickedCallback = useCallback(async () => {
        if (stakeEYEClicked) {
            const EYE_ETH = await API.EYE_ETH_PAIR(walletContextProps.networkName, walletContextProps.account)
            walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate
                .betaApply(EYE_ETH)
                .send({ from: walletContextProps.account })
                .on('receipt', function () {
                    setEyeEthButtonState(StakeButtonState.Staked)
                }).on('confirmation', function (confirmationNumber, receipt) {
                })
            setStakeEYEClicked(false)
        }
    }, [stakeEYEClicked])

    useEffect(() => { eyeClickedCallback() }, [stakeEYEClicked])


    const Blurb = <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        className={classes.blurb}
        spacing={2}
    >
        <Grid item className={classes.blurbTitle}>
            The experimental Liquid Queue Beta round has closed until further notice.
        </Grid>
    </Grid>

    return <Box>
        <Grid container
            direction="column"
            justify="space-between"
            alignItems="center"
            spacing={10}
        >
            <Grid item >
                {Blurb}
            </Grid>
            <Grid item>

            </Grid>
        </Grid>
    </Box >
}