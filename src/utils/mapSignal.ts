import { CreateSignalOptions, signal, Signal } from "@angular/core";

const mapequals = Map.prototype.equals ?? (function(m1: Map<any, any>, m2: Map<any, any>) {
    if (m1.size !== m2.size) {
        return false;
    }
    for (const [key, value] of m1) {
        if (value !== m2.get(key)) {
            return false;
        }
    }
    return true;
});

export interface MapSignal<K, V> extends Signal<ReadonlyMap<K, V>> {
    set(key: K, value: V): void;
    delete(key: K): void;
    asReadonly(): Signal<ReadonlyMap<K, V>>;
}

export function mapSignal<K, V>(
    initialValue: Map<K, V> = new Map(),
    options: CreateSignalOptions<Map<K, V>> = { equal: mapequals },
): MapSignal<K, V> {
    const sig = signal(initialValue, options);

    function set(key: K, value: V) {
        const sigValue = sig();
        sigValue.set(key, value);
        sig.set(sigValue);
    }
    function del(key: K) {
        const sigValue = sig();
        if (sigValue.delete(key)) {
            sig.set(sigValue);
        }
    }
    function asReadonly() {
        return sig.asReadonly();
    }

    return Object.assign(sig.asReadonly(), { set, delete: del, asReadonly });
}
