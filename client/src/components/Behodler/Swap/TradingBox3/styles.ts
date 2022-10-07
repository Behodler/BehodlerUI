import {makeStyles} from '@material-ui/core';
import {Logos} from './ImageLoader';

const sideScaler = (scale) => (perc) => (perc / scale) + '%'
const scaler = sideScaler(0.8)

export const useStyles = makeStyles(() => ({
    root: {
        margin: '0 auto',
        backgroundColor: 'rgba(255,255,255,0)',
        borderRadius: 20,
        alignContent: 'center',
        height: '100%',
        position: 'relative',
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        margin: '0 0',
    },
    buttonWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(218, 86, 221)',
        borderRadius: '5px',
        marginTop: 70,
        left: '35%',
    },
    buttonWrapperDisabled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(60, 60, 60)',
        borderRadius: '5px',
        marginTop: 70,
        left: '35%',
    },
    swapButton: {
        background: 'linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)',

        width: 500,
        '&:hover': {
            background: 'rgba(218, 86, 221,0.4)',
            fontWeight: 'bolder',
            textShadow: '2px 2px 5px white'
        },
    },
    swapButtonDisabled: {
        color: 'grey',
        backgroundColor: 'rgba(100,100,100,0.3)',
        width: 500,
        '&:hover': {
            backgroundColor: 'rgba(100,100,100,0.3)',

        },
    },
    swapButtonMobile: {
        background: 'linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)',

        width: 360,
        '&:hover': {
            background: 'rgba(218, 86, 221,0.4)',
            fontWeight: 'bolder',
            textShadow: '2px 2px 5px white'
        },
    },
    swapButtonMobileDisabled: {
        color: 'grey',
        backgroundColor: 'rgba(100,100,100,0.3)',

        width: 360,
        '&:hover': {
            backgroundColor: 'rgba(100,100,100,0.3)',
        },
    },
    hideIt: {
        color: 'white',
        fontWeight: 'bold',
        display: 'none'
    },
    centerWrapper: {
        margin: '0 auto',
        width: '80%',
        maxWidth: '1300px',
        position: 'absolute',
        left: '10%',
        top: '40%',
    },
    leftSelector: {
        position: 'absolute',
        left: '37%',
        top: '40%',
        zIndex: 10
    },
    rightSelector: {
        position: 'absolute',
        right: '37%',
        top: '40%',
        zIndex: 10
    },
    leftField: {
        position: 'absolute',
        left: scaler(14),
        top: '40%'
    },
    rightField: {
        position: 'absolute',
        right: scaler(15),
        top: '40%'

    },
    pyroShieldContainer: {
        position: 'relative',
        zIndex: 1,
        width: 350,
        //   background: 'radial-gradient(circle 90px, #DDD, transparent)',
        alignContent: 'center',
        margin: '0 -45px 0 -55px'

    },
    pyroShield: {
        display: 'block',
        margin: 'auto',
        '&:hover': {
            cursor: 'pointer'
        },
        filter: 'brightness(1.1)'
    },
    pyroShieldMobile: {
        display: 'block',
        margin: '0 30px 3px 30px',
        '&:hover': {
            cursor: 'pointer'
        },
        filter: 'brightness(1.1)'
    },
    pyroShieldMobileAnimated: {
        display: 'block',
        margin: '0 16px 0 16px',
        '&:hover': {
            cursor: 'pointer'
        },
        filter: 'brightness(1.3)'
    },
    fieldGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'

    },
    Info: {
        right: '1%',
        color: 'white',
        marginTop: 30
    }, mobileGrid: {
        maxWidth: '100%',
        width: 400,
    },
    mobileSelectorGrid: {},
    mobileContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '20px',
    },
    flippySwitch: {
        /* Ellipse 18 */
        width: 26,
        height: 26,
        background: '#2E2455',
        border: '1px solid #3C3682',
        boxSizing: 'border-box',
        borderRadius: '50%',
        backgroundImage: `url(${Logos.filter(l => l.name === 'flippyArrows')[0].image})`,
        backgroundSize: 'cover',
        '&:hover': {
            cursor: 'pointer',
            boxShadow: '0 0 4px 1px #AAf',
            background: '#473D6E',
            backgroundImage: `url(${Logos.filter(l => l.name === 'flippyArrows')[0].image}})`,
            backgroundSize: 'cover',
        }
    },
    transactionFeedbackState: {
        fontSize: 30,
        color: 'white'
    },
    impliedExchangeRate: {
        minHeight: '50px'
    },
    scxEstimationWarning: {

        width: 400,
        textAlign: 'center'
    },
    scxEstimationWarningText: {
        color: 'red',
        textShadow: 'rgb(200, 200, 200) 1px 1px 30px !important',
        fontSize: scale(20),
        textAlign: 'center',
        width: '100%'
    }

}))

const textScaler = (scale) => num => Math.floor(num * scale)
const scale = textScaler(0.9)

export const inputStyles = makeStyles(() => ({
    root: {
        width: scale(310),
    },
    mobileRoot: {
        width: scale(400),
        background: '#360C57',
        borderRadius: 10,
        padding: 10
    },
    Direction: {

        // height: 17,
        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: scale(16),
        // lineHeight: 17,
        /* identical to box height */
        color: 'darkGrey',
        textAlign: 'center',
        verticalAlign: 'middle',
    },
    BalanceContainer: {},
    BalanceLabel: {
        height: scale(19),

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: 'darkGrey'
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: scale(16),
        color: 'white'
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: '#80C2FF',
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: scale(19),

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: scale(16),
        color: 'white'
    },
    dollarSign: {
        color: 'grey',
        marginRight: 5,
        display: 'inline'
    },

    inputWide: {
        /* Vector */
        width: scale(300),
        height: scale(57),
        background: '#360C57',
        border: '1px solid rgba(70, 57, 130, 0.5)',
        boxSizing: 'border-box',
        /* 2.00073731114506 */

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 500,
        fontSize: scale(24),
        padding: '10px 20px 10px 20px',
        color: '#FFFFFF',
        outline: 0,
        borderRadius: 5,
        placeholder: {
            direction: 'rtl'
        }
    },
    inputNarrow: {
        width: scale(270),
        background: 'transparent',
        border: 'none',
        /* 2.00073731114506 */

        fontFamily: 'Gilroy',
        fontStyle: 'normal',
        fontWeight: 500,
        fontSize: scale(20),
        color: '#FFFFFF',
        outline: 0,
        placeHolder: {
            direction: 'rtl'
        }
    }
}))
