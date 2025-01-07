import { Component, computed, effect, untracked } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';
import { Bulletin, BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple, Candidat } from '../../datamodel/classes';
import { getRandomColor, newRandomValue } from '../../utils/utils';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  Math = Math;
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

  onDecrementVote(bid: number) {
    baseSignals.decrementVote(bid);
  }

  onIncrementVote(bid: number) {
    baseSignals.incrementVote(bid);
  }

  onDeleteBulletin(bid: number) {
    baseSignals.deleteBulletin(bid);
  }

  onResetModalBulletinForm() {
    // TODO
  }

  onValiderBulletinForm() {
    // TODO
  }


  getBulletinProgressColorAndText(bulletin: Bulletin): { progressColor: string, text: string } {
    let progressColor, text;
    switch (baseSignals.votingMethod()) {
      case VotingMethod.UNIQUE:
        const candidat = baseSignals.candidats().get((bulletin as BulletinSimple).candidatId)!;
        progressColor = candidat.color();
        text = candidat.name();
        break;

      case VotingMethod.APPROBATION:
        const candidatsApprouves = Array.from((bulletin as BulletinApprobation).candidatIds)
          .sort()
          .map(cid => baseSignals.candidats().get(cid)!);

        if (candidatsApprouves.length === 0) {
          text = "Aucun candidat (bulletin blanc)";
        } else {
          if (candidatsApprouves.length === 1) {
            progressColor = candidatsApprouves[0].color();
          }
          text = candidatsApprouves.map(c => c.name()).join(", ");
        }
        break;

      case VotingMethod.CLASSEMENT:
        const candidatsClasses = (bulletin as BulletinClassement).candidatIds
          .map(cid => baseSignals.candidats().get(cid)!);

        if (candidatsClasses.length === 0) {
          text = "Aucun candidat (bulletin blanc)";
        } else {
          if (candidatsClasses.length === 1) {
            progressColor = candidatsClasses[0].color();
          }
          text = candidatsClasses.map(c => c.name()).join(" > ");
        }
        break;

      case VotingMethod.NOTES:
        text = Array.from(baseSignals.candidats().values(), candidat =>
          `${candidat.name()} : ${(bulletin as BulletinNotes).notes.getOrDefault(candidat.id, 0)}`)
          .join(", ");
        break;

      default:
        throw new Error(`unhandled or unknown voting method : ${baseSignals.votingMethod()}`);
    }

    if (progressColor === undefined) {
      // deterministic color based on the bulletin id
      progressColor = getRandomColor(bulletin.id);
    }

    return { progressColor, text };
  }


  /**
   * Read and react to changes in votingMethod and candidats,
   * and apply changes to bulletins and (sometimes) votes accordingly.
   * No signal other than these 4 should be read,
   * no signal other than bulletins and votes should be written to.
   *
   * TODO: use linkedSignal for bulletins and votes when linkedSignal is stable.
   * With bulletins depending on votingMethod and candidats,
   * and votes depending on bulletins.
   */
  actuateBulletinsEffect = effect(function actuateBulletins() {
    const bulletins = untracked(baseSignals.bulletins);
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
