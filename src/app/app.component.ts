import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { LocalNotificationsService } from './core/services/local-notifications'; 
import { defineCustomElements } from '@ionic/pwa-elements/loader';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: 'app.component.html',
})
export class AppComponent {
  // 2. Inyección del servicio
  private notifService = inject(LocalNotificationsService);

  constructor() {
    addIcons(allIcons);
    this.notifService.init(); 
    defineCustomElements(window);
  }
}