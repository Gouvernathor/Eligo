import { VotingMethods } from "./constants";

export class Candidat {
    /**
     * @param {number} id
     * @param {string} name
     * @param {string} color
     * @param {number} borderWidth
     * @param {string} borderColor
     */
    constructor(id, name, color, borderWidth, borderColor) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }
}

export class Bulletin {
    static kind = null;
    /**
     * @param {number} id
     */
    constructor(id) {
        this.id = id;
    }
}
export class BulletinSimple extends Bulletin {
    static kind = VotingMethods.UNIQUE;
    /**
     * @param {number} candidatId
     */
    constructor(id, candidatId) {
        super(id);
        this.candidatId = candidatId;
    }
}
export class BulletinApprobation extends Bulletin {
    static kind = VotingMethods.APPROBATION;
    /**
     * @param {Set<number>|number[]} candidatIds
     */
    constructor(id, candidatIds) {
        super(id);
        this.candidatIds = candidatIds;
    }
}
export class BulletinClassement extends Bulletin {
    static kind = VotingMethods.CLASSEMENT;
    /**
     * @param {number[]} candidatIds
     */
    constructor(id, candidatIds) {
        super(id);
        this.candidatIds = candidatIds;
    }
}
export class BulletinNotes extends Bulletin {
    static kind = VotingMethods.NOTES;
    /**
     * @param {Map<number, number>} notes
     */
    constructor(id, notes) {
        super(id);
        this.notes = notes; // candidat vers note, ou note vers candidat ?
    }
}
