import RNG from "./RNG";
import "./extensions";

export function newRandomValue(blacklist: Iterable<number> = []): number {
    const blackset = new Set(blacklist);
    if (!blackset.size) {
        return window.crypto.getRandomValues(new Uint32Array(1))[0];
    }

    while (true) {
        for (const value of window.crypto.getRandomValues(new Uint32Array(blackset.size))) {
            if (!blackset.has(value)) {
                return value;
            }
        }
    }
}

export function sortMap<K, V>(map: Map<K, V>, orderedKeys: Iterable<K>) {
    for (const key of orderedKeys) {
        map.set(key, map.pop(key));
    }
}

export {RNG};

const colorRNG = new RNG();
export function getRandomColor(seed?: number|string): string {
    colorRNG.seed = seed;
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[colorRNG.randRange(16)]
    }
    return color;
}

export function sum(ar: Iterable<number>, start = 0): number {
    return (Array.isArray(ar) ? ar : [...ar])
        .reduce((a, b) => a + b, start);
}

export function* generateRainbow(n: number, alpha = "100%", maxHue = 300) {
    for (let i = 0; i < n; i++) {
        yield `hsla(${maxHue * i / (n - 1)}deg, 100%, 50%, ${alpha})`;
    }
}
