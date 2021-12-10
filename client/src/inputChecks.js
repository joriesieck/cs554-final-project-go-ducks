const inputChecks = {
	checkString (str, varName, doTrim, whiteSpcAllowed) {
		if (!str || arguments.length<4) throw Error(`Please provide a value for ${varName}.`);
		if (typeof str!=='string') throw Error(`${varName} must be a string.`);
		if (doTrim) str = str.trim();
		if (str==='') throw Error(`${varName} must contain at least one character.`);
		if (!whiteSpcAllowed && str.match(/[   ]/)) throw Error(`${varName} cannot contain any whitespace characters.`);
		return str;
	},
}

export default inputChecks;