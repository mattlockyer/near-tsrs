String.prototype.insertAfter = function (match, string) {
	return this.substring(0, this.indexOf(match) + match.length) + string + this.substring(this.indexOf(match) + match.length);
};