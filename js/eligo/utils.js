export function newRandomValue(blacklist = []) {
    const blackset = new Set(blacklist);
    if (!blackset.size)
        return window.crypto.getRandomValues(new Uint32Array(1))[0];

    while (true)
        for (const value of window.crypto.getRandomValues(new Uint32Array(blackset.size)))
            if (!blackset.has(value))
                return value;
}

/**
 * Makes the given keys of the map end up being ordered in the given order.
 * All members of orderedKeys must be present in map.
 * The ordering of other keys is kept stable.
 * @param {Map<K, V>} map
 * @param {Iterable<K>} orderedKeys
 */
export function sortMap(map, orderedKeys) {
    for (const key of orderedKeys) {
        map.set(key, map.pop(key));
    }
}

export class RNG {
    #m;
    #a;
    #c;
    #state;
    /**
     * @param {number} seed integer between 0 and 2^31 - 1
     */
    constructor(seed = null) {
        // LCG using GCC's constants
        this.m = 0x80000000; // 2**31;
        this.a = 1103515245;
        this.c = 12345;

        this.seed = seed;
    }
    /**
     * @param {number} seed
     */
    set seed(seed) {
        this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }
    randInt() {
        // presumably returns in [[0, m[[
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }
    random() {
        // returns in [0, 1[
        return this.randInt() / this.m;
    }
    randRange(min, max) {
        // returns in [[min, max[[
        return min + Math.floor(this.random() * (max - min));
    }
    choice(array) {
        return array[this.randRange(0, array.length)];
    }
}

const colorRNG = new RNG();
export function getRandomColor(seed = null) {
    colorRNG.seed = seed;
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[colorRNG.randRange(0, 16)];
    }
    return color;
}

Object.defineProperty(Map.prototype, 'pop', {
    value: function (key, def = undefined) {
        if (this.has(key)) {
            const value = this.get(key);
            this.delete(key);
            return value;
        }
        if (def === undefined)
            throw new Error(`Key ${key} not found`);
        return def;
    },
    writable: true,
    configurable: true,
});
Object.defineProperty(Map.prototype, 'getOrDefault', {
    value: function (key, def) {
        return this.has(key) ? this.get(key) : def;
    },
    writable: true,
    configurable: true,
});
Object.defineProperty(Map.prototype, 'equals', {
    value: function (other) {
        if (this.size !== other.size)
            return false;
        for (const [key, value] of this)
            if (value !== other.get(key))
                return false;
        return true;
    },
    writable: true,
    configurable: true,
});

export function sum(ar, start = 0) {
    return (Array.isArray(ar) ? ar : [...ar])
        .reduce((a, b) => a + b, start);
}

/**
 * @param {number} n number of colors to generate
 * @param {string} alpha
 * @param {number} maxhue in degrees
 */
export function* generate_rainbow(n, alpha = "100%", maxhue = 300) {
    for (let i = 0; i < n; i++)
        yield `hsla(${maxhue * i / (n-1)}deg, 100%, 50%, ${alpha})`;
}

Object.defineProperty(Set.prototype, 'equals', {
    value: function (other) {
        return this.symmetricDifference(other).size === 0;
    },
    writable: true,
    configurable: true,
});
