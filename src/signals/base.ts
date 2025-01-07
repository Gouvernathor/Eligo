import { Signal, signal, WritableSignal } from "@angular/core";
import { VotingMethod } from "../datamodel/constants";
import { Bulletin, Candidat } from "../datamodel/classes";

type id = number;

// base, internal versions
const votingMethod: WritableSignal<VotingMethod|null> = signal(null);
const attributionMethod: WritableSignal<null> = signal(null);
const candidats: WritableSignal<Map<id, Candidat>> = signal(new Map());
const bulletins: WritableSignal<Map<id, Bulletin>> = signal(new Map());
const votes: WritableSignal<Map<id, number>> = signal(new Map());
const nbElecteursManuel: WritableSignal<number|null> = signal(null);
const nNotes: WritableSignal<number> = signal(5);

// readonly versions, exported under the base name
const votingMethod_r = votingMethod.asReadonly();
const attributionMethod_r = attributionMethod.asReadonly();
const candidats_r = candidats.asReadonly() as Signal<ReadonlyMap<id, Candidat>>;
const bulletins_r = bulletins.asReadonly() as Signal<ReadonlyMap<id, Bulletin>>;
const votes_r = votes.asReadonly() as Signal<ReadonlyMap<id, number>>;
const nbElecteursManuel_r = nbElecteursManuel.asReadonly();
const nNotes_r = nNotes.asReadonly();
export {
    votingMethod_r as votingMethod,
    attributionMethod_r as attributionMethod,
    candidats_r as candidats,
    bulletins_r as bulletins,
    votes_r as votes,
    nbElecteursManuel_r as nbElecteursManuel,
    nNotes_r as nNotes,
};

// public setters
export function setVotingMethod(method: VotingMethod) {
    votingMethod.set(method);
}
export function addCandidat(cid: number, candidat: Candidat) {
    const candidatsValue = candidats();
    candidatsValue.set(cid, candidat);
    candidats.set(candidatsValue);
}
// TODO setCandidatData
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
export function setNbElecteursManuel(value: number|null) {
    nbElecteursManuel.set(value);
}
