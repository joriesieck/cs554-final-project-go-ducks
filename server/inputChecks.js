module.exports = {
	checkString (str, varName, whiteSpcAllowed) {
		if (!str || arguments.length<3) return {error:`Please provide a value for ${varName}.`};
		if (typeof str!=='string') return {error:`${varName} must be a string.`};
		str = str.trim();
		if (str==='') return {error:`${varName} must contain at least one character.`};
		if (!whiteSpcAllowed && str.match(/[   ]/)) return {error:`${varName} cannot contain any whitespace characters`};
		return {result:str};
	},
	checkBool (bool, varName) {
		if (bool===undefined || bool===null || arguments.length<2) return {error:`Please provide a value for ${varName}.`};
		if (typeof bool!=='boolean') return {error:`${varName} must be a boolean`};
		return {result:'success'};
	}
}