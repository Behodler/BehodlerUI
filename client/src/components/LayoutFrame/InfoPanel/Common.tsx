import * as React from 'react'

export const themedText = (classes: any) => (text: string | number, percentage: boolean = false) => <p className={classes.text}>{text}{percentage ? "%" : ""}</p>
