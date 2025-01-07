import { Component } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';
import * as baseSignals from '../../signals/base';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  VotingMethod = VotingMethod;
  baseSignals = baseSignals;

  onAddCandidat() {
    // TODO
  }

  onSetVotingMethod(method: VotingMethod) {
    baseSignals.setVotingMethod(method);
  }

  onSetNbElecteursManuel(event: Event) {
    baseSignals.setNbElecteursManuel(parseInt((event.target as HTMLInputElement).value));
  }

  onToggleElecteursManuel() {
    // TODO
  }

  onResetModalBulletinForm() {
    // TODO
  }

  onValiderBulletinForm() {
    // TODO
  }
}
