import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VotingMethod } from '../../datamodel/constants';
import { Bulletin } from '../../datamodel/classes';
import * as baseSignals from '../../signals/base';
import { ApprobComponent } from "./approb/approb.component";
import { NotesComponent } from "./notes/notes.component";

@Component({
  selector: 'app-bulletin-form',
  imports: [FormsModule, ApprobComponent, NotesComponent],
  templateUrl: './bulletin-form.component.html',
  styleUrl: './bulletin-form.component.scss'
})
export class BulletinFormComponent {
  modal = inject(NgbActiveModal);

  Math = Math;
  baseSignals = baseSignals;
  VotingMethod = VotingMethod;

  close() {
    const bulletin: Bulletin = null!;
    // TODO create the Bulletin object and pass it to the result callback
    this.modal.close(bulletin);
    // optionally make use of an Output event, whose payload can be typed
    // (as opposed to the modal.close promise which can't)
  }
}
