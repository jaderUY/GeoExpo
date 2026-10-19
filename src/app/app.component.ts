import { Component, Inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { LocalNotificationsService } from './core/services/local-notifications';
import * as allIcons from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private notifService = Inject(LocalNotificationsService);

  constructor() {
    addIcons(allIcons);
    this.notifService.init(); 
  }
}
