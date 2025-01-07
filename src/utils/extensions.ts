// make this a module
export {};

declare global {
    interface ReadonlyMap<K, V> {
        equals(other: ReadonlyMap<any, any>): boolean;
        getOrDefault(key: K, def: V): V;
    }
    interface Map<K, V> extends ReadonlyMap<K, V> {
        pop(key: K, def?: V): V;
    }

    interface ReadonlySet<T> {
        equals(other: ReadonlySet<any>): boolean;
        isSuperSetOf(other: Iterable<any>): boolean;
    }
    interface Set<T> extends ReadonlySet<T> {}
}

Map.prototype.equals = function(this: ReadonlyMap<any, any>, other: ReadonlyMap<any, any>) {
    if (this.size !== other.size) {
        return false;
    }
    for (const [key, value] of this) {
        if (value !== other.get(key)) {
            return false;
        }
    }
    return true;
}
Map.prototype.getOrDefault = function<K, V>(this: Map<K, V>, key: K, def: V) {
    return this.has(key) ? this.get(key) as V : def;
}
Map.prototype.pop = function<K, V>(this: Map<K, V>, key: K, def?: V) {
    if (this.has(key)) {
        const value = this.get(key);
        this.delete(key);
        return value as V;
    }
    if (def === undefined) {
        throw new Error(`Key ${key} not found`);
    }
    return def;
}

Set.prototype.equals = function(this: ReadonlySet<any>, other: ReadonlySet<any>) {
    // TODO upgrade language level and type dependencies
    // return this.symmetricDifference(other).size === 0;
    return Array.from(this).every(e => other.has(e))
        && Array.from(other).every(e => this.has(e));
}
Set.prototype.isSuperSetOf = function(this: ReadonlySet<any>, other: Iterable<any>) {
    // TODO set proper language level
    return Array.from(other).every(e => this.has(e));
}
