
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

export const listenEventAsync = async <K extends keyof DocumentEventMap>(target: Document, type: K,
    listener: (target: Document, ev: DocumentEventMap[K]) => any) => {
        return new Promise(resolve => target.addEventListener(type, ev => {
            listener(target, ev);
            resolve(ev);
        }, { once: true }));
    };

export const awaitEvent = async <K extends keyof DocumentEventMap>(target: Document, type: K,
    filter: (target: Document, ev: DocumentEventMap[K]) => boolean) => {
        while (true) {
            if (await listenEventAsync(target, type, (_, ev) => filter(target, ev)))
                break;
        }
    };

export const awaitSleep = async (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(() => resolve(), ms));
