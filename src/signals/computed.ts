import { computed, Signal } from "@angular/core";
import { sum } from "@gouvernathor/python";
import { VotingMethod } from "../datamodel/constants";
import { Bulletin, BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple } from "../datamodel/classes";
import { attributionMethod as baseAttributionMethod, bulletins, candidats, nbElecteursManuel, votes, votingMethod } from "./base";

export const attributionMethod = computed(() => {
    return baseAttributionMethod().get(votingMethod()?.ballotKind!) || null;
});

export const relevantBulletins: Signal<ReadonlyArray<Bulletin>> = computed(() => {
    const method = votingMethod();
    if (method === null) {
        return [];
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
            break;
    }
    return Array.from(bulletins().values())
        .filter(b => b.kind === method && isRelevant(b));
});

export const relevantVotes = computed(() => {
    const vots = votes();
    return new Map(relevantBulletins()
        .map((bulletin) => [bulletin, vots.getOrDefault(bulletin.id, 0)] as const));
});

export const nbVotes: Signal<number> = computed(() => {
    return sum(relevantVotes().values());
});

export const nbElecteurs: Signal<number> = computed(() => {
    return Math.max(nbVotes(), nbElecteursManuel() || 0);
});
