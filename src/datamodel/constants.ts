export class VotingMethod {
    static UNIQUE = new VotingMethod("unique", "Simple (vote unique)");
    static APPROBATION = new VotingMethod("approbation", "Approbation");
    static CLASSEMENT = new VotingMethod("classement", "Classement");
    static NOTES = new VotingMethod("notes", "Cardinal (par notes)");

    private constructor(
        public readonly id: string,
        public readonly desc: string,
    ) {}

    // public static *values() {
    //     const cls = this.constructor as typeof VotingMethod;
    //     yield cls.UNIQUE;
    //     yield cls.APPROBATION;
    //     yield cls.CLASSEMENT;
    //     yield cls.NOTES;
    // }
    public static values() {
        return [VotingMethod.UNIQUE, VotingMethod.APPROBATION, VotingMethod.CLASSEMENT, VotingMethod.NOTES];
    }
}
