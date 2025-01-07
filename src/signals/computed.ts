import { computed, Signal } from "@angular/core";
import { Bulletin, BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple } from "../datamodel/classes";
import { VotingMethod } from "../datamodel/constants";
import { bulletins, candidats, nbElecteursManuel, votes, votingMethod } from "./base";
import { sum } from "../utils/utils";

function getRelevantBulletins(method: VotingMethod|null = null): Bulletin[]|null {
    if (method === undefined) {
        method = votingMethod();
    }
    if (method === null) {
        return null;
    }

    const setCandidatIds = new Set(candidats().keys());
    let isRelevant: (b: any) => boolean;
    switch (method) {
        case VotingMethod.UNIQUE:
            isRelevant = (b: BulletinSimple) => setCandidatIds.has(b.candidatId);
            break;

        case VotingMethod.APPROBATION:
            isRelevant = (b: BulletinApprobation) => setCandidatIds.isSuperSetOf(b.candidatIds.keys());
            break;

        case VotingMethod.CLASSEMENT:
            isRelevant = (b: BulletinClassement) => setCandidatIds.equals(new Set(b.candidatIds));
            break;

        case VotingMethod.NOTES:
            isRelevant = (b: BulletinNotes) => setCandidatIds.isSuperSetOf(b.notes);
    }
    return Array.from(bulletins().values())
        .filter(b => b.kind === method && isRelevant(b));
}

// FIXME manage null in getRelevantBulletins
export const relevantBulletins: Signal<ReadonlyArray<Bulletin>|null> = computed(getRelevantBulletins);

export const nbVotes: Signal<number> = computed(() => {
    return sum(relevantBulletins()! // FIXME
        .map((bulletin) => votes().getOrDefault(bulletin.id, 0)));
});

export const nbElecteurs: Signal<number> = computed(() => {
    return Math.max(nbVotes(), nbElecteursManuel() || 0);
});
