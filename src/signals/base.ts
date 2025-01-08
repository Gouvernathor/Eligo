import { Signal, signal, WritableSignal } from "@angular/core";
import { VotingMethod } from "../datamodel/constants";
import { Bulletin, Candidat } from "../datamodel/classes";
import { sortMap } from "../utils/utils";

type id = number;

// base versions
const votingMethod: WritableSignal<VotingMethod|null> = signal(null);
const attributionMethod: WritableSignal<null> = signal(null);
const candidats: WritableSignal<Map<id, Candidat>> = signal(new Map(), {equal: Map.prototype.equals});
const bulletins: WritableSignal<Map<id, Bulletin>> = signal(new Map(), {equal: Map.prototype.equals});
const votes: WritableSignal<Map<id, number>> = signal(new Map(), {equal: Map.prototype.equals});
const nbElecteursManuel: WritableSignal<number|null> = signal(null);
const nNotes: WritableSignal<number> = signal(5);

// readonly versions, exported under the base name
const candidats_r = candidats.asReadonly() as Signal<ReadonlyMap<id, Candidat>>;
const bulletins_r = bulletins.asReadonly() as Signal<ReadonlyMap<id, Bulletin>>;
const votes_r = votes.asReadonly() as Signal<ReadonlyMap<id, number>>;
export {
    votingMethod,
    attributionMethod,
    candidats_r as candidats,
    bulletins_r as bulletins,
    votes_r as votes,
    nbElecteursManuel,
    nNotes,
};

// public specific setters (for those that need it)
export function setCandidat(cid: number, candidat: Candidat) {
    const candidatsValue = candidats();
    candidatsValue.set(cid, candidat);
    candidats.set(candidatsValue);
}
export function deleteCandidat(cid: number) {
    const candidatsValue = candidats();
    if (candidatsValue.delete(cid)) {
        candidats.set(candidatsValue);
    }
}
export function setBulletin(bid: id, bulletin: Bulletin) {
    const bulletinsValue = bulletins();
    bulletinsValue.set(bid, bulletin);
    bulletins.set(bulletinsValue);
}
export function setVote(bid: id, nVotes: number) {
    const votesValue = votes();
    votesValue.set(bid, nVotes);
    votes.set(votesValue);
}
export function sortBulletins(orderedIds: Iterable<id>, update = false) {
    sortMap(bulletins(), orderedIds);
    // TODO: trace what needs to be refreshed on bulletinsReordered and what doesn't
    if (update) {
        bulletins.set(bulletins());
    }
}
export function deleteBulletin(bid: id) {
    const bulletinsValue = bulletins();
    const votesValue = votes();
    if (bulletinsValue.delete(bid)) {
        bulletins.set(bulletinsValue);
    }
    if (votesValue.delete(bid)) {
        votes.set(votesValue);
    }
}
function crementVote(bid: id, crem: number) {
    const votesValue = votes();
    if (!votesValue.has(bid)) {
        throw new Error(`id ${bid} not found among votes`);
    }
    votesValue.set(bid, votesValue.get(bid)! + crem);
    votes.set(votesValue);
}
export function incrementVote(bid: id) {
    crementVote(bid, 1);
}
export function decrementVote(bid: id) {
    crementVote(bid, -1);
}
