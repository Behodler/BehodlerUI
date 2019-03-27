import * as React from 'react'

export interface ContractProps {
	weidaiPrice: number
	penaltyReductionPeriod: number
	nextPenaltyAdjustment: number,
	totalPriceGrowth: number,
	annualizedGrowth: number
}

export class ContractSection extends React.Component<ContractProps, any>{

}