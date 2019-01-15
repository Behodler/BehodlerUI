module.exports.handle = async (promise, reason) => {
	try {
		await promise;
		throw "EXPECTED";
	} catch (error) {
		if (error === "EXPECTED")
			assert.fail("expected an error but there was none");
		const message = !!error.reason?error.reason: JSON.stringify(error);
		if (message !== reason)
			assert.fail(`expected error:'${reason}' but was ${message}`);
		return;
	}
};
