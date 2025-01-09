import { Component } from '@angular/core';
import { ElectionComponent } from "../election/election.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [ElectionComponent]
})
export class MainComponent {
}
