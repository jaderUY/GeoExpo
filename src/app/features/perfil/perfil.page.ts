import { Component, inject, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonModal, IonAlert, IonItem, IonInput, IonSpinner, IonAvatar, IonLabel
} from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { person, logIn, personAdd, logOut, close, mail, lockClosed, happyOutline } from 'ionicons/icons';

import { AUTH_PORT } from '../../core/ports';
import { Usuario } from '../../core/models';
import { LocalNotificationsService } from '../../core/services/local-notifications'; 

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonModal, IonAlert, IonItem, IonInput, IonSpinner, IonAvatar, IonLabel, FormsModule
  ],
  host: { class: 'ion-page' }
})
export class PerfilPage {
  private authPort = inject(AUTH_PORT);
  private notif = inject(LocalNotificationsService); 

  user = signal<Usuario | null>(null); // estado del usuario actual
  isModalOpen = signal<boolean>(false);
  authMode = signal<'login' | 'register'>('login');
  
  // Campos del formulario
  emailInput = '';
  passInput = '';
  nameInput = '';

  // UI
  cargando = signal<boolean>(false);
  isAlertOpen = signal<boolean>(false);


  constructor() {
    addIcons({ person, logIn, personAdd, logOut, close, mail, lockClosed, happyOutline });
  }

  async ionViewWillEnter() {
    const currentUser = await this.authPort.currentUser();
    this.user.set(currentUser);
  }

  // ── Acciones de Sesión ────────────────────────────
  abrirModal(mode: 'login' | 'register') {
    this.authMode.set(mode);
    this.limpiarFormulario();
    this.isModalOpen.set(true);
  }

  cerrarModal() {
    this.isModalOpen.set(false);
    this.limpiarFormulario();
  }

  cambiarModo() {
    this.authMode.set(this.authMode() === 'login' ? 'register' : 'login');
    this.limpiarFormulario();
  }

  async procesarAuth() {
    // 1. Validaciones con Notificaciones Locales
    if (!this.emailInput || !this.passInput) {
      await this.notif.scheduleIn(1, 'Campos vacíos', 'Por favor, llena todos los campos.');
      return;
    }
    if (this.authMode() === 'register' && !this.nameInput) {
      await this.notif.scheduleIn(1, 'Falta nombre', 'El nombre es obligatorio.');
      return;
    }

    this.cargando.set(true);
    try {
      let loggedUser: Usuario;
      
      if (this.authMode() === 'login') {
        loggedUser = await this.authPort.login(this.emailInput, this.passInput);
      } else {
        loggedUser = await this.authPort.register(this.nameInput, this.emailInput, this.passInput);
      }

      this.user.set(loggedUser);
      this.cerrarModal();
      
      // 2. Notificación de éxito (Bienvenida)
      await this.notif.scheduleIn(1, '¡Bienvenido!', `Sesión iniciada como ${loggedUser.name}.`);
      
    } catch (e) {
      console.error(e);
      // 3. Notificación de error
      await this.notif.scheduleIn(1, 'Error', 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  confirmarLogout() {
    // MANTENEMOS EL ALERT porque necesitamos que el usuario confirme
    this.isAlertOpen.set(true);
  }

  async cerrarSesion() {
    try {
      await this.authPort.logout();
      this.user.set(null);
      
      // 4. Notificación de cierre de sesión
      await this.notif.scheduleIn(1, 'Sesión Cerrada', 'Has salido de tu cuenta de GeoExpo.');
      
    } catch (e) {
      console.error(e);
    }
  }

  // ── Helpers ───────────────────────────────────────
  private limpiarFormulario() {
    this.emailInput = '';
    this.passInput = '';
    this.nameInput = '';
  }
}

