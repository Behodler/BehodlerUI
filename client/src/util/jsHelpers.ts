import { BigNumber } from 'bignumber.js'

export const isNullOrWhiteSpace = (value: string) => !value || !value.trim();

export const notNullOrUndefined = (value: any) => !!value || value === 0

export const truncate = function (address: string): string {
	const beginning = address.substr(0, 6)
	const end = address.substr(address.length - 4)
	return beginning + "....." + end
};

export const formatNumberText = (text: string): string => {
	let dotCounter = 0
	var newText = text.split('').filter(c => {
		dotCounter = c === '.' ? dotCounter + 1 : dotCounter
		if (dotCounter > 1)
			return false
		return (c == '' || c == '.' || !isNaN(parseInt(c)))
	}).join('')
	if (newText.length > 1 && newText.charAt(0) === '0' && newText.charAt(1) !== '.')
		newText = newText.substring(1)
	if (newText.charAt(0) === '.')
		newText = '0' + newText
	return newText
}

export const formatDecimalStrings = (value: string, decimalPlaces: number = 2): string => {
	const big = new BigNumber(value)
	if (big.isNaN())
		return ""
	if(big.isGreaterThan(0))
		return big.decimalPlaces(decimalPlaces).toString()
	return value
}