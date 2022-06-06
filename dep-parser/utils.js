String.prototype.insertLineBefore = function (match, string) {
	const index = this.substring(0, this.indexOf(match)).lastIndexOf('\n');
	return this.substring(0, index) + string + this.substring(index) + `\n`;
};
String.prototype.insertLineAfter = function (match, string) {
	let index = this.indexOf(match);
	index += Math.max(this.substring(this.indexOf(match)).indexOf('\n'), match.length)
	return this.substring(0, index) + string + this.substring(index) + `\n`;
};
String.prototype.insertBeforeIndex = function (index, string) {
	return this.substring(0, index) + string + this.substring(index);
};
String.prototype.insertBefore = function (match, string) {
	return this.substring(0, this.indexOf(match)) + string + this.substring(this.indexOf(match));
};
String.prototype.insertAfter = function (match, string) {
	return this.substring(0, this.indexOf(match) + match.length) + string + this.substring(this.indexOf(match) + match.length);
};