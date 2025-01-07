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

  addCandidat() {
    // TODO
  }

  setVotingMethod(method: VotingMethod) {
    // TODO
  }

  onChangeNbElecteursManuel(event: Event) {
    this.setNbElecteursManuel(parseInt((event.target as HTMLInputElement).value));
    // TODO
  }

  setNbElecteursManuel(nb: number) {
    // TODO
  }

  toggleElecteursManuel() {
    // TODO
  }

  resetModalBulletinForm() {
    // TODO
  }

  validerBulletinForm() {
    // TODO
  }
}
