import React, {
    useCallback,
    useContext, useEffect,/*, useState*/
    useState
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dai from '../../../../images/behodler/dai.png'
import Eth from '../../../../images/behodler/3.png'
import SCX from '../../../../images/behodler/7.png'
import EYE from '../../../../images/behodler_b.png'
import { Tooltip } from '@material-ui/core';
import { GetAPY } from './LQCalculationHelper'
import { WalletContext } from 'src/components/Contexts/WalletStatusContext';
import API from 'src/blockchain/ethereumAPI';
import QueuePosition from './QueuePosition';


const useStyles = makeStyles({
    table: {
        minWidth: 650,
    }, icon: {
        maxWidth: 30
    }
});

function createData(imgsrc: any, inputToken: string, rewardToken: string, ROI: number, APY: number, eye: string, velocity: number, inputTokenAddress: string) {

    return { imgsrc, inputToken, rewardToken, ROI, APY, eye, velocity, inputTokenAddress };
}

interface Row {
    imgsrc: any
    inputToken: string
    rewardToken: string
    ROI: number
    APY: number
    eye: string
    velocity: number,
    inputTokenAddress: string
}

export interface QueueData {
    burnRatio: number
    entryIndex: number
    last: number
    length: number
    velocity: number,
    eyeActive: boolean,
    eyeReward: string
}
let emptyQueueData: QueueData = {
    burnRatio: 0,
    entryIndex: 0,
    last: 0,
    length: 0,
    velocity: 0,
    eyeActive: false,
    eyeReward: '0'
}

export default function LPList() {
    const walletContextProps = useContext(WalletContext)
    const addresses = API.getLQInputAddresses(walletContextProps.networkName)
    const [queueData, setQueueData] = useState<QueueData>(emptyQueueData)
    const [visiblePosition, setVisiblePosition] = useState<string | null>()

    const [rows, setRows] = useState<Row[]>([
        createData(Dai, 'Dai', 'DAI/EYE', 130, 2000, '', 0, addresses.Dai),
        createData(Eth, 'Ether', 'SCX/ETH', 130, 2000, '', 0, addresses.Eth),
        createData(SCX, 'Scarcity (SCX)', 'SCX/EYE', 130, 2000, '', 0, addresses.Scarcity),
        createData(EYE, 'EYE', 'SCX/EYE', 70, 2300, '', 0, addresses.Eye),
    ])
    const classes = useStyles();

    const getAPYfromRows = (address: string) => rows.filter(r => r.inputTokenAddress === address)[0].APY

    const roiCallback = useCallback(async () => {
        const newRows = [...rows]

        for (let i = 0; i < 4; i++) {
            if (walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.address === undefined)
                return
            const tiltpercentage = await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.tiltPercentage().call()

            const tiltDirection = await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.inputTokenTilting(rows[i].inputTokenAddress).call()
            const ROI = tiltDirection.toString() === rows[i].inputTokenAddress.toString() ? 100 + tiltpercentage : 100 - tiltpercentage
            newRows[i].ROI = ROI;
            newRows[i].APY = GetAPY(rows[i].ROI, rows[i].velocity, queueData.length)
        }
        setRows(newRows)
    }, [walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.address])

    useEffect(() => { roiCallback() })
    useEffect(() => {
        const effect = API.liquidQueueEffects.queueDataEffect()
        const subscription = effect.Observable.subscribe(data => {
            let item: QueueData = {
                burnRatio: parseInt(data.burnRatio),
                entryIndex: parseInt(data.entryIndex),
                last: parseInt(data.last),
                length: parseInt(data.length),
                velocity: parseInt(data.velocity),
                eyeActive: data.eyeActive.toString().toLowerCase() === 'true',
                eyeReward: data.eyeReward.toString()
            }

            setQueueData(item)

        })
        return () => { subscription.unsubscribe() }
    }, [])

    useEffect(() => {
        const newRows = rows.map(row => {
            let newRow = row;
            newRow.velocity = queueData.velocity
            newRow.APY = GetAPY(row.ROI, row.velocity, queueData.length)
            newRow.eye = queueData.eyeActive ? API.fromWei(queueData.eyeReward) : 'Inactive'
            return newRow
        })
        setRows(newRows)
    }, [queueData])

    return (visiblePosition ? <QueuePosition data={queueData} setVisiblePosition={setVisiblePosition} inputToken={visiblePosition} APY={getAPYfromRows(visiblePosition)} /> :
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Input Token</TableCell>
                        <Tooltip title="Your input token is matched with a reward to produce a Uniswap LP token"><TableCell align="right">Reward LP Token</TableCell></Tooltip>
                        <Tooltip title="The value of the reward relative to your input token. This value is realized immediately and forms the minimum possible return."><TableCell align="right" >ROI</TableCell></Tooltip>
                        <Tooltip title="APY is the annualized growth of ROI through compounding. Compounding is achieved by immediately re-entering the queue. The faster the queue, the higher the APY. This value represents your maximum return possible at current rates."><TableCell align="right">APY</TableCell></Tooltip>
                        <Tooltip title="When the queue velocity falls for too long, a per second Eye reward kicks in."><TableCell align="right">EYE reward per second</TableCell></Tooltip>
                        <Tooltip title="Queue entrants per two week period"><TableCell align="right">Queue Velocity</TableCell></Tooltip>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.inputToken}>
                            <TableCell><img className={classes.icon} width={30} src={row.imgsrc} /> </TableCell>
                            <TableCell component="th" scope="row">
                                {row.inputToken}
                            </TableCell>
                            <TableCell align="center">N/A</TableCell>
                            <TableCell align="center">N/A</TableCell>
                            <TableCell align="center">N/A</TableCell>
                            <TableCell align="center">N/A</TableCell>
                            <TableCell align="center">N/A</TableCell>
                            <TableCell align="center">N/A</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
