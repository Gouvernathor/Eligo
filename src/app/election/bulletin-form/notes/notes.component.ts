import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BulletinNotes } from '../../../../datamodel/classes';
import * as baseSignals from '../../../../signals/base';
import * as computedSignals from '../../../../signals/computed';
import { mapSignal } from '../../../../utils/mapSignal';
import { newRandomValue } from '../../../../utils/utils';

@Component({
  selector: 'app-bulletin-form-notes',
  imports: [FormsModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  baseSignals = baseSignals;

  notes = mapSignal(new Map<number, number>(), {equal: () => false});

  minNNotes = computed(() =>
    // using several calls to Math.max so that the number of parameters is not too many
    1 + Math.max(1,
      Math.max(...this.notes().values()),
      Math.max(...computedSignals.relevantBulletins()
        .map(b => Math.max(...(b as BulletinNotes).notes.values()))),
    )
  );

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
    const notes = this.notes();
    return (computedSignals.relevantBulletins() as BulletinNotes[]).find(b =>
      b.notes.equals(notes)
    ) || new BulletinNotes(newRandomValue(baseSignals.bulletins().keys()), notes);
  }

  ngOnDestroy() {
    baseSignals.nNotes.set(this.inputNNotesValue);
  }
}
