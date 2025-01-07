import { Component, computed, effect } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';
import { Bulletin, BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple, Candidat } from '../../datamodel/classes';
import { getRandomColor, newRandomValue, sortMap } from '../../utils/utils';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  VotingMethod = VotingMethod;
  baseSignals = baseSignals;
  computedSignals = computedSignals;

  nbElecteursManuelVisible = computed(() => {
    const val = baseSignals.nbElecteursManuel();
    return val === null ?
      computedSignals.nbVotes() :
      Math.max(val, computedSignals.nbVotes());
  });

  onAddCandidat() {
    const cid = newRandomValue(baseSignals.candidats().keys());
    const candidat = new Candidat(cid, "", getRandomColor(), 0, "#000000");
    baseSignals.setCandidat(cid, candidat);

    // jscolor.install(partycard)
  }

  onSetCandidatName(candidat: Candidat, event: Event) {
    candidat.name.set((event.target as HTMLInputElement).value);
  }
  onSetCandidatColor(candidat: Candidat, event: Event) {
    candidat.color.set((event.target as HTMLInputElement).value);
  }
  onSetCandidatBorderWidth(candidat: Candidat, event: Event) {
    candidat.borderWidth.set(Number((event.target as HTMLInputElement).value));
  }
  onSetCandidatBorderColor(candidat: Candidat, event: Event) {
    candidat.borderColor.set((event.target as HTMLInputElement).value);
  }

  onDeleteCandidat(cid: number) {
    baseSignals.deleteCandidat(cid);
  }

  onSetVotingMethod(method: VotingMethod) {
    baseSignals.setVotingMethod(method);
  }

  onSetNbElecteursManuel(event: Event) {
    baseSignals.setNbElecteursManuel(parseInt((event.target as HTMLInputElement).value));
  }

  onToggleElecteursManuel(event: Event) {
    // TODO retravailler les règles d'affichage du nb manuel d'électeurs
    if ((event.target as HTMLInputElement).checked) {
      baseSignals.setNbElecteursManuel(computedSignals.nbVotes());
    } else {
      baseSignals.setNbElecteursManuel(null);
    }
  }

  onResetModalBulletinForm() {
    // TODO
  }

  onValiderBulletinForm() {
    // TODO
  }


  /**
   * Read and react to changes in votingMethod and candidats,
   * and apply changes to bulletins and (sometimes) votes accordingly.
   * No signal other than these 4 should be read,
   * no signal other than bulletins and votes should be written to.
   * TODO: use linkedSignal for bulletins and votes when linkedSignal is stable.
   */
  actuateBulletinsEffect = effect(function actuateBulletins() {
    const bulletins = baseSignals.bulletins();
    const votingMethod = baseSignals.votingMethod();
    switch (votingMethod) {
      case null:
        break;

      case VotingMethod.UNIQUE:
        const bulletinByCandidatId = new Map<number, BulletinSimple>(
          (Array.from(bulletins.values())
            .filter(b => b.kind === VotingMethod.UNIQUE) as BulletinSimple[])
            .map(b => [b.candidatId, b])
        );

        // cleanup obsolete ballots
        for (const [cid, b] of bulletinByCandidatId) {
          if (!baseSignals.candidats().has(cid)) {
            baseSignals.deleteBulletin(b.id);
            bulletinByCandidatId.delete(cid); // not really necessary
          }
        }
        // get sorted ballot ids,
        // creating missing ballots in the way
        const sortedBulletinIds = Array.from(baseSignals.candidats().keys())
          .map(cid => {
            let bid = bulletinByCandidatId.get(cid)?.id;
            if (bid === undefined) {
              bid = newRandomValue(bulletins.keys());
              const bulletin = new BulletinSimple(bid, cid);
              baseSignals.setBulletin(bid, bulletin);
              baseSignals.setVote(bid, 1);
            }
            return bid;
          });
        // sort the ballots by the order of the candidates
        baseSignals.sortBulletins(sortedBulletinIds);
        // cannot do it by updating the bulletins signal,
        // otherwise there would be infinite recursion

        break;

      case VotingMethod.APPROBATION:
      case VotingMethod.CLASSEMENT:
      case VotingMethod.NOTES:
        const bulletinsConcernes = Array.from(bulletins.values())
          .filter(b => b.kind === votingMethod);

        const candidatIds = new Set(baseSignals.candidats().keys());
        // cleanup obsolete ballots
        const testCandidats = votingMethod === VotingMethod.APPROBATION ?
          ((b: BulletinApprobation) => candidatIds.isSuperSetOf(b.candidatIds)) :
          votingMethod === VotingMethod.CLASSEMENT ?
            ((b: BulletinClassement) => candidatIds.isSuperSetOf(new Set(b.candidatIds))) :
            ((b: BulletinNotes) => candidatIds.isSuperSetOf(b.notes));
        for (const bulletin of bulletinsConcernes) {
          // if candidates were removed, remove the ballot
          if (!testCandidats(bulletin as any)) {
            baseSignals.deleteBulletin(bulletin.id);
          }
        }

        break;

      default:
        throw new Error(`unhandled or unknown voting method : ${votingMethod}`);
    }
  });
}
