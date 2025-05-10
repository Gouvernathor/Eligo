import { Component, computed, effect, inject, untracked } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AttributionMethodBuilder, attributionMethods, BallotKind, VotingMethod } from '../../datamodel/constants';
import { Bulletin, BulletinApprobation, BulletinClassement, BulletinNotes, BulletinSimple, Candidat } from '../../datamodel/classes';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';
import { getRandomColor, newRandomValue } from '../../utils/utils';
import { BulletinFormComponent } from './bulletin-form/bulletin-form.component';
import { DiagrammeComponent } from "../diagramme/diagramme.component";

@Component({
  selector: 'app-election',
  imports: [DiagrammeComponent],
  templateUrl: './election.component.html',
  styleUrl: './election.component.scss'
})
export class ElectionComponent {
  private modalService = inject(NgbModal);

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
  currentBallotKind = computed(() => {
    const voting = baseSignals.votingMethod();
    if (voting === null) {
      return null;
    }
    return BallotKind[voting.ballotKind];
  });
  validAttributionMethods = computed(() => {
    const voting = baseSignals.votingMethod();
    if (voting === null) {
      return {};
    }
    return attributionMethods[voting.ballotKind];
  });
  idsAttributionMethods = computed(() => {
    return Object.keys(this.validAttributionMethods());
  });

  private attribMethodNames = new Map<string, string>([
    ["MAJO", "Scrutin majoritaire"],

    ["DHONDT", "Proportionnelle, plus forte moyenne (D'Hondt)"],
    ["WEBSTER", "Proportionnelle, plus forte moyenne (Webster/Sainte-Laguë)"],
    ["HHILL", "Proportionnelle, plus forte moyenne (Huntington-Hill)"],
    ["HARE", "Proportionnelle, plus forte reste (Hamilton/Hare)"],

    ["STV", "Vote unique transférable"],
    ["BORDA", "Méthode Borda"],
    ["CONDOR", "Méthode de Condorcet"],

    ["MEAN", "Jugement majoritaire, meilleure note moyenne"],
    ["MEDIAN", "Jugement majoritaire, meilleure note médiane"],
  ]);

  getAttribMethodName(id: string) {
    return this.attribMethodNames.get(id) ?? id;
  }

  onAddCandidat() {
    const cid = newRandomValue(baseSignals.candidats().keys());
    const candidat = new Candidat(cid, "", getRandomColor(), 0, "#000000");
    baseSignals.candidats.set(cid, candidat);

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
    baseSignals.candidats.delete(cid);
  }

  onSetVotingMethod(method: VotingMethod) {
    baseSignals.votingMethod.set(method);
  }

  onSetAttributionMethod(method: AttributionMethodBuilder) {
    baseSignals.attributionMethod.set(baseSignals.votingMethod()!.ballotKind, method);
  }

  onSetNbElecteursManuel(event: Event) {
    baseSignals.nbElecteursManuel.set(parseInt((event.target as HTMLInputElement).value));
  }

  onToggleElecteursManuel(event: Event) {
    // TODO retravailler les règles d'affichage du nb manuel d'électeurs
    if ((event.target as HTMLInputElement).checked) {
      baseSignals.nbElecteursManuel.set(computedSignals.nbVotes());
    } else {
      baseSignals.nbElecteursManuel.set(null);
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


  openModalBulletinForm() {
    const modalRef = this.modalService.open(BulletinFormComponent);
    (modalRef.componentInstance as BulletinFormComponent).bulletins.subscribe(bulletin => this.onValiderBulletinForm(modalRef, bulletin))
  }

  onValiderBulletinForm(modalRef: NgbModalRef, bulletin: Bulletin) {
    if (baseSignals.bulletins().has(bulletin.id)) {
      throw new Error("Un bulletin identique existe déjà");
      // TODO handle in a way that's normal and visible by the user
      // (Toast and/or Alert of Angular-Bootstrap)
    } else {
      baseSignals.setBulletin(bulletin.id, bulletin);
      baseSignals.setVote(bulletin.id, 0);
      modalRef.close();
    }
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
          progressColor = "white";
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
          progressColor = "white";
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
