import { Component, computed } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';

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
    // TODO
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
}
