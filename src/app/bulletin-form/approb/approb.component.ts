import { Component } from '@angular/core';
import { BulletinApprobation } from '../../../datamodel/classes';
import * as baseSignals from '../../../signals/base';
import * as computedSignals from '../../../signals/computed';
import { newRandomValue } from '../../../utils/utils';

@Component({
  selector: 'app-bulletin-form-approb',
  imports: [],
  templateUrl: './approb.component.html',
  styleUrl: './approb.component.scss'
})
export class ApprobComponent {
  baseSignals = baseSignals;

  candidatIds: Set<number> = new Set();

  onCandidatToggled(cid: number, event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      this.candidatIds.add(cid);
    } else {
      this.candidatIds.delete(cid);
    }
  }

  /**
   * If a bulletin with the same set of candidates already exists,
   * returns it,
   * otherwise creates a new bulletin.
   */
  generate(): BulletinApprobation {
    return (computedSignals.relevantBulletins() as BulletinApprobation[]).find(b => {
      const bcids = (b as BulletinApprobation).candidatIds;
      const has = Array.isArray(bcids) ?
        (e: number) => bcids.includes(e) :
        (e: number) => (bcids as Set<number>).has(e);
      return Array.from(this.candidatIds).every(e => has(e))
        && Array.from(bcids).every(e => this.candidatIds.has(e));
    }) || new BulletinApprobation(newRandomValue(baseSignals.bulletins().keys()), this.candidatIds);
  }
}
