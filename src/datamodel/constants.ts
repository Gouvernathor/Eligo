import { Attribution } from "ecclesia/base/election/attribution"
import { AverageScore, Borda, Condorcet, DHondt, Hare, HuntingtonHill, InstantRunoff, MedianScore, Plurality, Webster } from "ecclesia/concrete/election/attribution"

export enum BallotKind {
    SIMPLE,
    ORDER,
    SCORES,
}

export class VotingMethod {
    private constructor(
        public readonly id: string,
        public readonly desc: string,
        public readonly ballotKind: BallotKind,
    ) {}

    static UNIQUE = new VotingMethod("unique", "Simple (vote unique)", BallotKind.SIMPLE);
    static APPROBATION = new VotingMethod("approbation", "Approbation", BallotKind.SIMPLE);
    static CLASSEMENT = new VotingMethod("classement", "Classement", BallotKind.ORDER);
    static NOTES = new VotingMethod("notes", "Cardinal (par notes)", BallotKind.SCORES);

    public static values() {
        return [VotingMethod.UNIQUE, VotingMethod.APPROBATION, VotingMethod.CLASSEMENT, VotingMethod.NOTES];
    }
}

export class AttributionMethod {
    private constructor(
        public readonly ballotType: BallotKind,
        public readonly attribution: new(a: any) => Attribution<any, any>,
        public readonly tip?: string,
    ) {}

    static MAJO = new AttributionMethod(BallotKind.SIMPLE, Plurality);
    static DHONDT = new AttributionMethod(BallotKind.SIMPLE, DHondt);
    static WEBSTER = new AttributionMethod(BallotKind.SIMPLE, Webster);
    static HHILL = new AttributionMethod(BallotKind.SIMPLE, HuntingtonHill);
    static HARE = new AttributionMethod(BallotKind.SIMPLE, Hare);

    static STV = new AttributionMethod(BallotKind.ORDER, InstantRunoff,
        "Chaque électeur classe les candidats par ordre de préférence. Tant qu'aucun candidat n'est en tête sur une majorité de bulletins, candidat étant en tête du plus petit nombre de bulletins est élimité.");
    static BORDA = new AttributionMethod(BallotKind.ORDER, Borda);
    static CONDOR = new AttributionMethod(BallotKind.ORDER, Condorcet,
        "Chaque électeur classe les candidats par ordre de préférence. Des duels sont simulés entre chaque paire de candidats. Si un candidat gagne tous ses duels, il est élu.");

    static MEAN = new AttributionMethod(BallotKind.SCORES, AverageScore);
    static MEDIAN = new AttributionMethod(BallotKind.SCORES, MedianScore);
}
