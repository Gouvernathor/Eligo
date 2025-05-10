import { Signal, signal } from "@angular/core";
import { mapSignal } from "mapsignal";
import { AttributionMethodBuilder, BallotKind, VotingMethod } from "../datamodel/constants";
import { Bulletin, Candidat } from "../datamodel/classes";
import { sortMap } from "../utils/utils";

// base versions
const votingMethod = signal<VotingMethod|null>(null);
const attributionMethod = mapSignal<BallotKind, AttributionMethodBuilder>();
const candidats = mapSignal<number, Candidat>();
const bulletins = signal(new Map<number, Bulletin>(), { equal: () => false });
const votes = signal(new Map<number, number>(), { equal: () => false });
const nbElecteursManuel = signal<number|null>(null);
const nNotes = signal(5);

// readonly versions, exported under the base name
const bulletins_r = bulletins.asReadonly() as Signal<ReadonlyMap<number, Bulletin>>;
const votes_r = votes.asReadonly() as Signal<ReadonlyMap<number, number>>;
export {
    votingMethod,
    attributionMethod,
    candidats,
    bulletins_r as bulletins,
    votes_r as votes,
    nbElecteursManuel,
    nNotes,
};

// public specific setters (for those that need it)
export function setBulletin(bid: number, bulletin: Bulletin) {
    const bulletinsValue = bulletins();
    bulletinsValue.set(bid, bulletin);
    bulletins.set(bulletinsValue);
}
export function setVote(bid: number, nVotes: number) {
    const votesValue = votes();
    votesValue.set(bid, nVotes);
    votes.set(votesValue);
}
export function sortBulletins(orderedIds: Iterable<number>, update = false) {
    sortMap(bulletins(), orderedIds);
    // TODO: trace what needs to be refreshed on bulletinsReordered and what doesn't
    if (update) {
        bulletins.set(bulletins());
    }
}
export function deleteBulletin(bid: number) {
    const bulletinsValue = bulletins();
    const votesValue = votes();
    if (bulletinsValue.delete(bid)) {
        bulletins.set(bulletinsValue);
    }
    if (votesValue.delete(bid)) {
        votes.set(votesValue);
    }
}
function crementVote(bid: number, crem: number) {
    const votesValue = votes();
    if (!votesValue.has(bid)) {
        throw new Error(`id ${bid} not found among votes`);
    }
    votesValue.set(bid, votesValue.get(bid)! + crem);
    votes.set(votesValue);
}
export function incrementVote(bid: number) {
    crementVote(bid, 1);
}
export function decrementVote(bid: number) {
    crementVote(bid, -1);
}
