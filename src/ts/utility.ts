export const shuffleArray = <T>(array: T[]): T[] => {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = result[i];
		result[i] = result[j];
		result[j] = tmp;
	}
	return result;
};

export const newArray = <T>(size: number, elementCreator: (index: number) => T): T[] => new Array(size).fill(null).map((_, i) => elementCreator(i));

export const awaitSleep = async (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(() => resolve(), ms));
