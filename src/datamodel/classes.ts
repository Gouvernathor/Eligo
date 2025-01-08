import { signal, WritableSignal } from "@angular/core";
import { VotingMethod } from "./constants";

export class Candidat {
    public readonly name: WritableSignal<string>;
    public readonly color: WritableSignal<string>;
    public readonly borderWidth: WritableSignal<number>;
    public readonly borderColor: WritableSignal<string>;

    constructor(
        public readonly id: number,
        name: string,
        color: string,
        borderWidth: number,
        borderColor: string,
    ) {
        this.name = signal(name);
        this.color = signal(color);
        this.borderWidth = signal(borderWidth);
        this.borderColor = signal(borderColor);
    }
}

// readonly until and unless mutation is needed

export abstract class Bulletin {
    static kind: VotingMethod;

    constructor(
        public readonly id: number,
    ) {}

    get kind() {
        return (this.constructor as typeof Bulletin).kind;
    }
}
export class BulletinSimple extends Bulletin {
    static override kind = VotingMethod.UNIQUE;

    constructor(
        id: number,
        public readonly candidatId: number,
    ) {
        super(id);
    }
}
export class BulletinApprobation extends Bulletin {
    static override kind = VotingMethod.APPROBATION;

    constructor(
        id: number,
        public readonly candidatIds: ReadonlySet<number>|ReadonlyArray<number>,
        // TODO retype as ReadonlySet
    ) {
        super(id);
    }
}
export class BulletinClassement extends Bulletin {
    static override kind = VotingMethod.CLASSEMENT;

    constructor(
        id: number,
        public readonly candidatIds: ReadonlyArray<number>,
    ) {
        super(id);
    }
}
export class BulletinNotes extends Bulletin {
    static override kind = VotingMethod.NOTES;

    constructor(
        id: number,
        public readonly notes: ReadonlyMap<number, number>,
    ) {
        super(id);
    }
}
