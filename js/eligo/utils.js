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

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
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
