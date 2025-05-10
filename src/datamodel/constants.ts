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

export interface AttributionMethod {
    readonly ballotType: BallotKind;
    readonly attribution: new (a: any) => Attribution<any, any>;
    readonly tip?: string;
}
export namespace AttributionMethod {
    export const MAJO: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: Plurality,
    };
    export const DHONDT: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: DHondt,
    };
    export const WEBSTER: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: Webster,
    };
    export const HHILL: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: HuntingtonHill,
    };
    export const HARE: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: Hare,
    };

    export const STV: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: InstantRunoff,
        tip: "Chaque électeur classe les candidats par ordre de préférence. Tant qu'aucun candidat n'est en tête sur une majorité de bulletins, candidat étant en tête du plus petit nombre de bulletins est élimité.",
    };
    export const BORDA: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: Borda,
    };
    export const CONDOR: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: Condorcet,
        tip: "Chaque électeur classe les candidats par ordre de préférence. Des duels sont simulés entre chaque paire de candidats. Si un candidat gagne tous ses duels, il est élu.",
    };

    export const MEAN: AttributionMethod = {
        ballotType: BallotKind.SCORES,
        attribution: AverageScore,
    };
    export const MEDIAN: AttributionMethod = {
        ballotType: BallotKind.SCORES,
        attribution: MedianScore,
    };
}
