import { type Attribution, type HasNSeats, averageScore, bordaCount, condorcet, dHondt, hareLargestRemainders, huntingtonHill, instantRunoff, medianScore, plurality, webster } from "ecclesia/election/attribution";

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

export type AttributionMethodBuilder = <Party>({ nSeats }: {
    nSeats: number;
}) => Attribution<Party, any> & HasNSeats;

// the tips are stored in a separate map
export const attributionMethods: Readonly<Record<BallotKind, Readonly<Record<string, AttributionMethodBuilder>>>> = [
    {
        MAJO: plurality,
        // superMajority,

        DHONDT: dHondt, // jefferson
        WEBSTER: webster, // sainteLague
        HHILL: (o) => huntingtonHill({ threshold: 0, ...o }),
        HARE: hareLargestRemainders, // hamilton

        // randomize
    },
    {
        STV: instantRunoff,
        BORDA: bordaCount,
        CONDOR: condorcet,
    },
    {
        MEAN: averageScore,
        MEDIAN: medianScore,
    },
];
// maybe move that to the component
export const tips: Readonly<Record<string, string>> = {
    STV: "Chaque électeur classe les candidats par ordre de préférence. Tant qu'aucun candidat n'est en tête sur une majorité de bulletins, candidat étant en tête du plus petit nombre de bulletins est élimité.",
    CONDOR: "Chaque électeur classe les candidats par ordre de préférence. Des duels sont simulés entre chaque paire de candidats. Si un candidat gagne tous ses duels, il est élu.",
};

// deprecated
interface AttributionMethod {
    readonly ballotType: BallotKind;
    readonly attribution: <Party>({ nSeats }: {
        nSeats: number;
    }) => Attribution<Party, any> & HasNSeats;
    readonly tip?: string;
}
namespace AttributionMethod {
    export const MAJO: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: plurality,
    };
    // superMajority

    export const DHONDT: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: dHondt, // jefferson
    };
    export const WEBSTER: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: webster, // sainteLague
    };
    export const HHILL: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: (o) => huntingtonHill({ threshold: 0, ...o }),
    };
    export const HARE: AttributionMethod = {
        ballotType: BallotKind.SIMPLE,
        attribution: hareLargestRemainders, // hamilton
    };

    // randomize


    export const STV: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: instantRunoff,
        tip: "Chaque électeur classe les candidats par ordre de préférence. Tant qu'aucun candidat n'est en tête sur une majorité de bulletins, candidat étant en tête du plus petit nombre de bulletins est élimité.",
    };
    export const BORDA: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: bordaCount,
    };
    export const CONDOR: AttributionMethod = {
        ballotType: BallotKind.ORDER,
        attribution: condorcet,
        tip: "Chaque électeur classe les candidats par ordre de préférence. Des duels sont simulés entre chaque paire de candidats. Si un candidat gagne tous ses duels, il est élu.",
    };

    export const MEAN: AttributionMethod = {
        ballotType: BallotKind.SCORES,
        attribution: averageScore,
    };
    export const MEDIAN: AttributionMethod = {
        ballotType: BallotKind.SCORES,
        attribution: medianScore,
    };
}
