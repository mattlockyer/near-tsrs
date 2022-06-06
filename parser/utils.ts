
declare global {
	interface String {
		prefix(str: string): string;
	}
}

String.prototype.prefix = function (str: string): string {
	return str + this
};

export {}
