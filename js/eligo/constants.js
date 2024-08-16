export class VotingMethods {
    static UNIQUE = new VotingMethods("unique", "Simple (vote unique)");
    static APPROBATION = new VotingMethods("approbation", "Approbation");
    static CLASSEMENT = new VotingMethods("classement", "Classement");
    static NOTES = new VotingMethods("notes", "Cardinal (par notes)");

    static values() {
        return [this.UNIQUE, this.APPROBATION, this.CLASSEMENT, this.NOTES];
    }

    constructor(id, desc) {
        this.id = id;
        this.desc = desc;
    }
}
