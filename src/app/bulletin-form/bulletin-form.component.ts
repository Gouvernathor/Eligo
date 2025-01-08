import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VotingMethod } from '../../datamodel/constants';
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

  @ViewChild("subcomponent") subComponent?: ApprobComponent|NotesComponent;

  close() {
    if (this.subComponent) {
      this.modal.close(this.subComponent.generate());
    }
    // optionally make use of an Output event, whose payload can be typed
    // (as opposed to the modal.close promise which can't)
  }
}
