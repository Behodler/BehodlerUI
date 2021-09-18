import { FormControl, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { MoveFocusInside } from 'react-focus-lock'

import { formatNumberText, isNullOrWhiteSpace } from 'src/util/jsHelpers'
import { tokenProps } from "./NewField"
// import { WalletContext } from 'src/components/Contexts/WalletStatusContext'
// import { useEffect, useCallback, useState, useContext } from 'react'
// import { Button, IconButton, Box, makeStyles, Theme } from '@material-ui/core'
const scaler = (scale) => num => Math.floor(num * scale)
const scale = scaler(0.9)
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: scale(310),
    },
    mobileRoot: {
        width: scale(400),
        background: "#360C57",
        borderRadius: 10,
        padding: 10
    },
    Direction: {

        // height: 17,
        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        // lineHeight: 17,
        /* identical to box height */
        color: "darkGrey",
        textAlign: "center",
        verticalAlign: " middle",
    },
    inputWide: {
        /* Vector */
        width: scale(300),
        height: scale(57),
        background: "#360C57",
        border: "1px solid rgba(70, 57, 130, 0.5)",
        boxSizing: "border-box",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(24),
        padding: "10px 20px 10px 20px",
        color: "#FFFFFF",
        outline: 0,
        borderRadius: 5,
        placeholder:{
            direction: "rtl"
        }    
    },
    inputNarrow: {
        width: scale(270),
        background: "transparent",
        border: "none",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(20),
        color: "#FFFFFF",
        outline: 0,
        placeHolder:{
            direction: "rtl"
        }    
        
    },
    BalanceContainer: {

    },
    BalanceLabel: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "#80C2FF",
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
}))


export function StyledInput(props: { mobile?: boolean, token: tokenProps, focus: boolean, setFocus: () => void }) {
    const classes = useStyles()

    const setFormattedInput = (value: string) => {
        if (isNullOrWhiteSpace(value)) {

            props.token.value.set('')
            if (!props.token.valid.value)
                props.token.valid.set(true)
        }
        else {
            const formattedText = formatNumberText(value)
            props.token.value.set(value)
            const parsedValue = parseFloat(formattedText)
            const isValid = isNaN(parsedValue) ? false : parsedValue < parseFloat(props.token.balance)
            if (props.token.valid.value != isValid)
                props.token.valid.set(isValid)
        }
    }
    const FocusElement = props.focus ? (props: { children?: any }) => <MoveFocusInside>{props.children}</MoveFocusInside> : (props: { children?: any }) => <div>{props.children}</div>
    return <div>
        <FormControl>
            <FocusElement>
                <input
                    id={props.token.address}
                    key={props.token.address}
                    placeholder={props.token.name}
                    
                    //  inputRef={input => input && input.focus()}
                    value={props.token.value.value} onChange={(event) => { props.setFocus(); setFormattedInput(event.target.value) }} className={props.mobile ? classes.inputNarrow : classes.inputWide} />
            </FocusElement>
        </FormControl>
    </div>
}
