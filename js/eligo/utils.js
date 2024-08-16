export function newRandomValue(blacklist = []) {
    const blackset = new Set(blacklist);
    if (!blackset.size)
        return Crypto.getRandomValues(new Uint32Array(1))[0];

    while (true)
        for (const value of Crypto.getRandomValues(new Uint32Array(blackset.size)))
            if (!blackset.has(value))
                return value;
}
