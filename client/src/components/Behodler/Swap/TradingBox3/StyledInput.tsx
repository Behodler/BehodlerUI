import { FormControl, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { DebounceInput } from 'react-debounce-input';
import { formatNumberText, isNullOrWhiteSpace } from 'src/util/jsHelpers'
// import { WalletContext } from 'src/components/Contexts/WalletStatusContext'
// import { useEffect, useCallback, useState, useContext } from 'react'
// import { Button, IconButton, Box, makeStyles, Theme } from '@material-ui/core'
const scaler = (scale) => num => Math.floor(num * scale)
const scale = scaler(0.9)
const useStyles = makeStyles((theme: Theme) => ({



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
        placeholder: {
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
        placeHolder: {
            direction: "rtl"
        }

    },

}))

interface props {
    mobile?: boolean,
    value: string
    setValue: (value: string) => void
    valid: boolean
    setValid: (valid: boolean) => void
    address: string
    balance: string
    name: string
}

export function StyledInput(props: props) {
    const classes = useStyles()
    const setFormattedInput = (value: string) => {
        if (isNullOrWhiteSpace(value)) {

            props.setValue('')
            if (!props.valid)
                props.setValid(true)
        }
        else {
            const formattedText = formatNumberText(value)
            props.setValue(value)
            const parsedValue = parseFloat(formattedText)
            const isValid = isNaN(parsedValue) ? false : parsedValue < parseFloat(props.balance)
            if (props.valid != isValid)
                props.setValid(isValid)
        }
    }
    return <div>
        <FormControl>
            <DebounceInput
                id={props.address}
                key={props.address}
                placeholder={props.name}
                debounceTimeout={300}
                //  inputRef={input => input && input.focus()}
                value={props.value} onChange={(event) => { setFormattedInput(event.target.value) }}
                className={props.mobile ? classes.inputNarrow : classes.inputWide} />
        </FormControl>
    </div>
}
