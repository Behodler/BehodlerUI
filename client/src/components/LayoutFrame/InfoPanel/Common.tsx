import * as React from 'react'

export const themedText = (classes: any) => (text: string | number, percentage: boolean = false, icon:any|undefined=undefined) =>(
	 <p className={classes.text}>{!!icon?icon:""}{text}{percentage ? "%" : ""}</p>)
