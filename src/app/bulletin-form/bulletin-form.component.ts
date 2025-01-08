import { Component, computed, inject, Input } from '@angular/core';
import { VotingMethod } from '../../datamodel/constants';
import { Bulletin, BulletinNotes } from '../../datamodel/classes';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bulletin-form',
  imports: [FormsModule],
  templateUrl: './bulletin-form.component.html',
  styleUrl: './bulletin-form.component.scss'
})
export class BulletinFormComponent {
  modal = inject(NgbActiveModal);

  Math = Math;
  baseSignals = baseSignals;
  VotingMethod = VotingMethod;

  minNNotes = computed(() => {
    return 1 + Math.max(1, ...computedSignals.relevantBulletins()
      .flatMap(b => Array.from((b as BulletinNotes).notes.values())));
  });

  inputNNotesValue = Math.max(this.minNNotes(), baseSignals.nNotes());

  close() {
    const bulletin: Bulletin = null!;
    // TODO create the Bulletin object and pass it to the result callback
    this.modal.close(bulletin);
  }
}
