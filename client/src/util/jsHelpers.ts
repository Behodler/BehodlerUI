export const isNullOrWhiteSpace = (value: string) => !value || !value.trim();

export const notNullOrUndefined = (value: any) => !!value || value === 0

export const truncate = function (address: string): string {
	const beginning = address.substr(0, 6)
	const end = address.substr(address.length - 4)
	return beginning + "....." + end
};