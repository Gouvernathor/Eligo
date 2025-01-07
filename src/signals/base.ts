import { Signal, signal } from "@angular/core";
import { VotingMethod } from "../datamodel/constants";
import { Bulletin, Candidat } from "../datamodel/classes";

type id = number;

export const votingMethod: Signal<VotingMethod|null> = signal(null);
export const attributionMethod: Signal<null> = signal(null);
export const candidats: Signal<ReadonlyMap<id, Candidat>> = signal(new Map());
export const bulletins: Signal<ReadonlyMap<id, Bulletin>> = signal(new Map());
export const votes: Signal<ReadonlyMap<id, number>> = signal(new Map());
export const nbElecteursManuel: Signal<number|null> = signal(null);
export const nNotes: Signal<number> = signal(5);
