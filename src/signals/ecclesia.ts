import { computed, Signal } from "@angular/core";
import { Counter } from "@gouvernathor/python/collections";
import { Ballots } from "ecclesia/base/election/ballots";
import { ScoresBase } from "ecclesia/concrete/election/ballots";
import { VotingMethod } from "../datamodel/constants";
import { BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple } from "../datamodel/classes";
import { nNotes, votingMethod } from "./base";
import { relevantVotes } from "./computed";

/**
 * The Party in the ballots is the candidate ID.
 */
export const votesToEcclesiaBallots: Signal<Ballots<number>|null> = computed(function() {
    const relevant = relevantVotes();
    switch (votingMethod()) {
        case null:
            return null;

        case VotingMethod.UNIQUE: {
            const rv = new Counter<number>();
            for (const [bulletin, nVotes] of relevant) {
                rv.increment((bulletin as BulletinSimple).candidatId, nVotes);
            }
            return rv;
        }

        case VotingMethod.APPROBATION: {
            const rv = new Counter<number>();
            for (const [bulletin, nVotes] of relevant) {
                for (const candidatId of (bulletin as BulletinApprobation).candidatIds) {
                    rv.increment(candidatId, nVotes);
                }
            }
            return rv;
        }

        case VotingMethod.CLASSEMENT: {
            return Array.from(relevant, ([bulletin, nVotes]) => [(bulletin as BulletinClassement).candidatIds, nVotes] as const)
                .flatMap(([candidatIds, nVotes]) => Array.from({length: nVotes}, () => candidatIds));
        }

        case VotingMethod.NOTES: {
            const rv = ScoresBase.fromGrades<number>(nNotes());
            for (const [bulletin, nVotes] of relevant) {
                for (const [candidatId, note] of (bulletin as BulletinNotes).notes) {
                    rv.get(candidatId)![note] += nVotes;
                }
            }
            return rv;
        }

        default:
            throw new Error(`Unknown voting method ${votingMethod()}`);
    }
});
