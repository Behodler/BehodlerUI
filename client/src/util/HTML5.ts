interface friendlyField {
	address: string
	friendly: string
}

export const loadHomeActiveStep = () =>{
	let activeStep = localStorage.getItem('activeStep')
	return !!activeStep?parseInt(activeStep):0
}

export const setHomeActiveStep = (activeStep:number)=>{
	localStorage.setItem("activeStep", `${activeStep}`);
}

const loadFriendlyArray = (): friendlyField[] => {
	try {
		let friendlies = localStorage.getItem("friendly");
		if (friendlies) {
			const friendlyArray: friendlyField[] = JSON.parse(friendlies)
			return friendlyArray
		}
	} catch (exception) {
		console.log('error loading friendly: ' + exception)
	}
	return []
}

export const loadFriendlyName = (address: string): string => {
	let friendly = '';
	const friendlyArray = loadFriendlyArray()
	const field = friendlyArray.filter(hedgehog => hedgehog.address === address)
	if (field.length > 0)
		friendly = field[0].friendly
	return friendly
}

export const setFriendlyName = (address: string, friendly: string) => {
	if (friendly.length === 0)
		return
	let friendlyArray = loadFriendlyArray()
	const indexOfAddress = friendlyArray.findIndex(hedgehog => hedgehog.address === address)
	if (indexOfAddress !== -1) {
		friendlyArray[indexOfAddress].friendly = friendly
	}
	else {
		friendlyArray = [...friendlyArray, { address, friendly }]
	}
	try {
		const serializedArray = JSON.stringify(friendlyArray)
		localStorage.setItem("friendly", serializedArray);

	} catch (exception) {
		console.log('error saving friendly to local HTML5 storage: ' + exception)
	}
}
