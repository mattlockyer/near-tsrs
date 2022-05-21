export type bytes = any;

export interface NearContract {
	init(...args: any[]): void;
}

export const storage_write = (key: string, value: string | number) => {}
export const storage_read = (key: string): string => ''