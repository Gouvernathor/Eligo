export function newRandomValue(blacklist = []) {
    if (!blacklist.length)
        return Crypto.getRandomValues(new Uint32Array(1))[0];

    const black = new Set(blacklist);
    while (true)
        for (const value of Crypto.getRandomValues(new Uint32Array(black.size)))
            if (!black.has(value))
                return value;
}
