import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BulletinNotes } from '../../../../datamodel/classes';
import * as baseSignals from '../../../../signals/base';
import * as computedSignals from '../../../../signals/computed';
import { newRandomValue } from '../../../../utils/utils';

@Component({
  selector: 'app-bulletin-form-notes',
  imports: [FormsModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  baseSignals = baseSignals;

  notes: Map<number, number> = new Map();

  minNNotes = computed(() => {
    return 1 + Math.max(1,
      // FIXME a change in this.notes will not trigger a recompute
      // maybe make notes a signal ?
      ...this.notes.values(),
      ...computedSignals.relevantBulletins()
        .flatMap(b => Array.from((b as BulletinNotes).notes.values())),
    );
  });

  inputNNotesValue = Math.max(this.minNNotes(), baseSignals.nNotes());

  onNoteChanged(cid: number, event: Event) {
    this.notes.set(cid, parseInt((event.target as HTMLInputElement).value));
  }

  /**
   * If a bulletin with the same notations already exists,
   * returns it,
   * otherwise creates a new bulletin.
   */
  generate(): BulletinNotes {
    return (computedSignals.relevantBulletins() as BulletinNotes[]).find(b =>
      b.notes.equals(this.notes)
    ) || new BulletinNotes(newRandomValue(baseSignals.bulletins().keys()), this.notes);
  }

  ngOnDestroy() {
    baseSignals.nNotes.set(this.inputNNotesValue);
  }
}
