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

export const newArray = <T>(size: number, elementCreator: (index: number) => T): T[] => {
	return new Array(size).fill(null).map((v, i) => elementCreator(i));
};

export const listenEventOnceAsync = async <K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K): Promise<HTMLElementEventMap[K]> => {
		return new Promise(resolve => target.addEventListener(type, ev => {
			resolve(ev);
			return ev;
		}, { once: true }));
	};

export const awaitEvent = async <K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K,
	filter: (target: HTMLElement, ev: HTMLElementEventMap[K]) => boolean) => {
		while (true) {
			if (await listenEventOnceAsync(target, type).then(ev => filter(target, ev)))
				break;
		}
	};

export const awaitSleep = async (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(() => resolve(), ms));
