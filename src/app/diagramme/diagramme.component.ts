import { Component, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { VotingMethod } from '../../datamodel/constants';
import { BulletinApprobation, BulletinNotes, BulletinSimple } from '../../datamodel/classes';
import * as baseSignals from '../../signals/base';
import * as computedSignals from '../../signals/computed';
import { generateRainbow, sum } from '../../utils/utils';

@Component({
  selector: 'app-diagramme',
  imports: [BaseChartDirective],
  templateUrl: './diagramme.component.html',
  styleUrl: './diagramme.component.scss'
})
export class DiagrammeComponent {
  baseSignals = baseSignals;
  computedSignals = computedSignals;

  chart = computed(function() {
    switch (baseSignals.votingMethod()) {
      case VotingMethod.UNIQUE: {
        const bulletins = computedSignals.relevantBulletins() as BulletinSimple[];

        const labels = []; // candidate names in candidate order
        const data = []; // number of votes for each candidate's bulletin
        const backgroundColor = []; // candidate colors in order
        const borderWidth = []; // candidate border widths in order
        const borderColor = []; // candidate border colors in order
        for (const [cid, candidat] of baseSignals.candidats()) {
          labels.push(candidat.name());
          const bulletin = bulletins.find(b => b.candidatId === cid)!;
          data.push(baseSignals.votes().getOrDefault(bulletin.id, 0));
          backgroundColor.push(candidat.color());
          borderWidth.push(candidat.borderWidth());
          borderColor.push(candidat.borderColor());
        }
        // TODO if abstaining is accounted for, add a transparent area

        return {
          type: "pie" as const,
          data: {
            labels,
            datasets: [{
              label: "Votes",
              data,
              backgroundColor,
              borderWidth,
              borderColor,
            }],
          },
          options: {},
        }
      }

      case VotingMethod.APPROBATION: {
        const bulletins = computedSignals.relevantBulletins() as BulletinApprobation[];
        const votes = baseSignals.votes();
        const total = sum(bulletins.map(b => votes.getOrDefault(b.id, 0)));

        const labels = [];
        const data = [];
        const backgroundColor = [];
        const borderWidth = [];
        const borderColor = [];
        for (const [cid, candidat] of baseSignals.candidats()) {
          labels.push(candidat.name());
          data.push(sum(bulletins
            .filter(b => new Set(b.candidatIds).has(cid))
            .map(b => votes.getOrDefault(b.id, 0))));
          backgroundColor.push(candidat.color());
          borderWidth.push(candidat.borderWidth());
          borderColor.push(candidat.borderColor());
        }

        // TODO ajouter un cercle de majorité ? (comment ?)

        return {
          type: "polarArea" as const,
          data: {
            labels,
            datasets: [{
              label: "Nombre d'approbations",
              data,
              backgroundColor,
              borderWidth,
              borderColor,
            }],
          },
          options: {
            scales: {
              r: {
                max: total,
              },
            },
          },
        };
      }

      case VotingMethod.NOTES: {
        const bulletins = computedSignals.relevantBulletins() as BulletinNotes[];

        const labels = [];
        const datasets = [];

        const nNotes = baseSignals.nNotes();
        const rainbowgen = generateRainbow(nNotes, "100%", 120);
        // const alpharainbowgen = generateRainbow(nNotes, "50%", 120);
        for (let note = 0; note < nNotes; note++) {
          const color = rainbowgen.next().value as string;
          // const alphacolor = alpharainbowgen.next().value as string;
          datasets.push({
            label: `Notes inférieures ou égales à ${note}`,
            data: [] as number[],
            fill: true,
            backgroundColor: color,
            // backgroundColor: alphacolor,
            // borderColor: color,
            borderWidth: 0,
            pointBackgroundColor: color,
            pointBorderColor: "white",
            pointRadius: 5,
            pointHoverBackgroundColor: "white",
            pointHoverBorderColor: color,
            pointHoverRadius: 7,
          });
        }

        const votes = baseSignals.votes();
        for (const [cid, candidat] of baseSignals.candidats()) {
          labels.push(candidat.name());
          for (let note = 0; note < nNotes; note++) {
            let ofThisNote = 0;
            for (const bulletin of bulletins) {
              if (bulletin.notes.getOrDefault(cid, 0) <= note) {
                ofThisNote += votes.getOrDefault(bulletin.id, 0);
              }
            }
            datasets[note].data.push(ofThisNote);
          }
        }

        // cercle en pointillés
        datasets.unshift({
          label: "Médiane",
          data: Array(labels.length).fill(computedSignals.nbVotes() / 2),
          fill: false,
          borderColor: "#888",
          borderDash: [10, 5],
          pointRadius: 0,
        });

        return {
          type: "radar" as const,
          data: {
            labels,
            datasets,
          },
          options: {
            scales: {
              r: {
                beginAtZero: true,
              },
            },
            // elements: {
            //   line: {
            //     tension: .1, // makes the lines less straight
            //   },
            // },
          },
        };
      }

      default:
        // throw new Error(`Unknown or unimplemented voting method: ${baseSignals.votingMethod()}`);
        return null;
    }
  });
}
