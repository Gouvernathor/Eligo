import { Attribution } from "ecclesia/base/election/attribution"
import { AverageScore, Borda, Condorcet, DHondt, Hare, HuntingtonHill, InstantRunoff, MedianScore, Plurality, Webster } from "ecclesia/concrete/election/attribution"

export enum BallotKind {
    SIMPLE,
    ORDER,
    SCORES,
}

export interface VotingMethod {
    readonly id: string;
    readonly desc: string;
    readonly ballotKind: BallotKind;
}
export namespace VotingMethod {
    export const UNIQUE: VotingMethod = {
        id: "unique",
        desc: "Simple (vote unique)",
        ballotKind: BallotKind.SIMPLE,
    };
    export const APPROBATION: VotingMethod = {
        id: "approbation",
        desc: "Approbation",
        ballotKind: BallotKind.SIMPLE,
    };
    export const CLASSEMENT: VotingMethod = {
        id: "classement",
        desc: "Classement",
        ballotKind: BallotKind.ORDER,
    };
    export const NOTES: VotingMethod = {
        id: "notes",
        desc: "Cardinal (par notes)",
        ballotKind: BallotKind.SCORES,
    };
    export const values = () => [UNIQUE, APPROBATION, CLASSEMENT, NOTES];
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
