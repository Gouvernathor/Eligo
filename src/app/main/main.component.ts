import { Component } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  VotingMethod = VotingMethod;

  onAddCandidat() {
    // TODO
  }

  onSetVotingMethod(method: VotingMethod) {
    // TODO
  }

  onSetNbElecteursManuel(event: Event) {
    this.setNbElecteursManuel(parseInt((event.target as HTMLInputElement).value));
    // TODO
  }

  setNbElecteursManuel(nb: number) {
    // déplacer en service
    // TODO
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
