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
