import { Button, Grid, TextField } from '@material-ui/core'
import * as React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { WalletContext } from '../../../Contexts/WalletStatusContext'



const reload = () => {
    var r = confirm('reload?')
    if (r) location.reload()
}

export default function StepSelection() {
    const context = useContext(WalletContext)
    const [currentStep, setCurrentStep] = useState<number>(1)

    useEffect(() => {
        context.contracts.behodler.Behodler2.Morgoth.Migrator
            .stepCounter()
            .call()
            .then(setCurrentStep)
    })
    switch (currentStep) {
        case 1: return <Step1 />
        case 2: return <Step2 />
        case 3: return <Step3 />
        case 4: return <Step4 />
        case 5: return <Step5 />
        case 6: return <Step6 />
        case 7: return <Step7 />
        default:
            return <h4>Migration Complete</h4>
    }
}

function Step1(props: {}) {
    const [prepareClicked, setPrepareClicked] = useState<boolean>()
    const [step1Clicked, setStep1Clicked] = useState<boolean>()
    const context = useContext(WalletContext)

    const clickCallback = useCallback(async () => {
        if (prepareClicked) {
            const behodler1Contracts = context.contracts.behodler
            const behodler2Contracts = context.contracts.behodler.Behodler2
            const migrator = behodler2Contracts.Morgoth.Migrator
            if (behodler1Contracts.Lachesis.primary().call() !== migrator.address) {
                behodler1Contracts.Lachesis.transferPrimary(migrator.address).send({ from: context.account })
            }
            if (behodler1Contracts.Scarcity.primary().call() !== migrator.address) {
                behodler1Contracts.Scarcity.transferPrimary(migrator.address).send({ from: context.account })
            }
            if (behodler1Contracts.Behodler.primary().call() !== migrator.address) {
                behodler1Contracts.Behodler.transferPrimary(migrator.address).send({ from: context.account })
            }

            behodler2Contracts.Behodler2.setWhiteListUser(migrator.address, true).send({ from: context.account })

            if (behodler2Contracts.Behodler2.owner().call() !== migrator.address) {
                behodler2Contracts.Behodler2.transferOwnership(migrator.address).send({ from: context.account })
            }
            if (behodler2Contracts.Lachesis.owner().call() !== migrator.address) {
                behodler2Contracts.Lachesis.transferOwnership(migrator.address).send({ from: context.account });
            }

            if (behodler2Contracts.LiquidityReceiver.owner().call() !== migrator.address) {
                behodler2Contracts.LiquidityReceiver.transferOwnership(migrator.address).send({ from: context.account });
            }
            setPrepareClicked(false)
        }
    }, [prepareClicked])

    useEffect(() => {
        clickCallback()
    }, [prepareClicked])

    const step1Callback = useCallback(async () => {
        if (step1Clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step1().send({ from: context.account }, reload)
            setStep1Clicked(false)
        }
    }, [step1Clicked])

    useEffect(() => {
        step1Callback()
    }, [step1Clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    > <Grid item>
            <Button onClick={() => setPrepareClicked(true)}>
                WhiteList and Transfer to Migrator
    </Button>
        </Grid>
        <Grid item>
            <Button onClick={() => setStep1Clicked(true)}>
                Step 1
    </Button>
        </Grid>
    </Grid>
}

function Step2(props: {}) {
    //text boxes for token addresses
    const [addresses, setAddresses] = useState<string>('')
    const [clicked, setClicked] = useState<boolean>(false)
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            const array = addresses.split(',')
                .map(a => a.trim())

            context.contracts.behodler.Behodler2.Morgoth.Migrator.step2(array).send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    > <Grid item>
            <TextField onChange={(event) => setAddresses(event.target.value)} />
        </Grid>
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 2
    </Button>
        </Grid>
    </Grid>
    //execute
}

function Step3(props: {}) {
    const [clicked, setClicked] = useState<boolean>(false)
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step3().send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    >
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 3
    </Button>
        </Grid>
    </Grid>
    //execute
}

function Step4(props: {}) {
    //text boxes for token addresses
    const [iterations, setIterations] = useState<string>('')
    const [clicked, setClicked] = useState<boolean>(false)
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step4(iterations).send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    > <Grid item>
            <TextField onChange={(event) => setIterations(event.target.value)} />
        </Grid>
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 4
    </Button>
        </Grid>
    </Grid>
    //execute
}

function Step5(props: {}) {
    const [clicked, setClicked] = useState<boolean>(false)
    const [iterations, setIterations] = useState<string>('')
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step5(iterations).send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    >
        <Grid item>
            <TextField onChange={(event) => setIterations(event.target.value)} />
        </Grid>
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 5
    </Button>
        </Grid>
    </Grid>
    //execute
}

function Step6(props: {}) {
    //text boxes for token addresses
    const [iterations, setIterations] = useState<string>('')
    const [clicked, setClicked] = useState<boolean>(false)
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step6(iterations).send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    > <Grid item>
            <TextField onChange={(event) => setIterations(event.target.value)} />
        </Grid>
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 6
    </Button>
        </Grid>
    </Grid>
    //execute
}

function Step7(props: {}) {
    const [clicked, setClicked] = useState<boolean>(false)
    const context = useContext(WalletContext)

    useEffect(() => {
        if (clicked) {
            context.contracts.behodler.Behodler2.Morgoth.Migrator.step7().send({ from: context.account }, reload)
            setClicked(false)
        }
    }, [clicked])

    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
    >
        <Grid item>
            <Button onClick={() => setClicked(true)}>
                Step 7
    </Button>
        </Grid>
    </Grid>
    //execute
}
