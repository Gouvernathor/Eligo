import { Component } from '@angular/core';
import { ElectionComponent } from "../election/election.component";
import { HouseComponent } from "../house/house.component";
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [NgbNavModule, ElectionComponent, HouseComponent]
})
export class MainComponent {
}
