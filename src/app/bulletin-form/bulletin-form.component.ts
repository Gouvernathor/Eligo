import { Component, computed, inject, output, viewChild } from '@angular/core';
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

  private approbComponent = viewChild(ApprobComponent);
  private notesComponent = viewChild(NotesComponent);
  subComponent = computed(() => this.approbComponent() || this.notesComponent());

  bulletins = output<Bulletin>();

  emit() {
    const subComponent = this.subComponent();
    if (subComponent) {
      this.bulletins.emit(subComponent.generate());
    }
  }
}
