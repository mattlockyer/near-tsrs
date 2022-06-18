
declare global {
	interface String {
		prefix(str: string): string;
		insertLineBefore(match: string, str: string): string;
	}
}

String.prototype.insertLineBefore = function (match: string, str: string): string {
	const index = this.substring(0, this.indexOf(match)).lastIndexOf('\n');
	return this.substring(0, index) + '\n' + str + '\n' + this.substring(index);
};

String.prototype.prefix = function (str: string): string {
	return str + this
};

export {}
