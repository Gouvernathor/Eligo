import { VotingMethod } from "./constants";

// readonly until and unless mutation is needed

export class Candidat {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly color: string,
        public readonly borderWidth: number,
        public readonly borderColor: string,
    ) {}
}

export class Bulletin {
    static kind: VotingMethod;

    constructor(
        public readonly id: number,
    ) {}

    get kind() {
        return (this.constructor as typeof Bulletin).kind;
    }
}
export class BulletinSimple extends Bulletin {
    static kind = VotingMethod.UNIQUE;

    constructor(
        id: number,
        public readonly candidatId: number,
    ) {
        super(id);
    }
}
export class BulletinApprobation extends Bulletin {
    static kind = VotingMethod.APPROBATION;

    constructor(
        id: number,
        public readonly candidatIds: ReadonlySet<number>|ReadonlyArray<number>,
    ) {
        super(id);
    }
}
export class BulletinClassement extends Bulletin {
    static kind = VotingMethod.CLASSEMENT;

    constructor(
        id: number,
        public readonly candidatIds: ReadonlyArray<number>,
    ) {
        super(id);
    }
}
export class BulletinNotes extends Bulletin {
    static kind = VotingMethod.NOTES;

    constructor(
        id: number,
        public readonly notes: ReadonlyMap<number, number>,
    ) {
        super(id);
    }
}
