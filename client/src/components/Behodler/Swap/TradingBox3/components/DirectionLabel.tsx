import React from "react";

import {inputStyles} from "../styles";

export function DirectionLabel(props: { direction: string }) {
    const classes = inputStyles()
    return <div className={classes.Direction}>
        {props.direction}
    </div>
}
