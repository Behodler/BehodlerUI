import * as React from 'react'
import { DetailProps } from './Detail'
import { ListItem } from '@material-ui/core';
export const themedText = (classes: any) => (text: string | number, percentage: boolean = false, icon: any | undefined = undefined) => (
	<p className={classes.text}>{!!icon ? icon : ""}{text}{percentage ? "%" : ""}</p>)


export interface ClickAbleInfoProps {
	details: DetailProps
	setDetailProps: (props: DetailProps) => void
	children: any
	setDetailVisibility: (visible: boolean) => void
}

export function ClickAbleInfoListItem(props: ClickAbleInfoProps) {
	return (
		<ListItem button onClick={() => { props.setDetailProps(props.details); props.setDetailVisibility(true) }}>
			{props.children}
		</ListItem>
	)
}