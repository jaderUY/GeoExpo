import { Component, inject, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonModal, IonAlert, IonToast,
  IonItem, IonInput, IonSpinner, IonAvatar, IonLabel
} from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel en los inputs
import { addIcons } from 'ionicons';
import {
  person, logIn, personAdd, logOut, close, mail, lockClosed, happyOutline
} from 'ionicons/icons';

import { AUTH_PORT } from '../../core/ports';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonModal, IonAlert, IonToast,
    IonItem, IonInput, IonSpinner, IonAvatar, IonLabel,
    FormsModule
  ],
  host: { class: 'ion-page' }, // Regla de oro
})
export class PerfilPage {
  private authPort = inject(AUTH_PORT);

  // ── Estado de la sesión ───────────────────────────
  user = signal<Usuario | null>(null);

  // ── Estado del Modal (Auth) ───────────────────────
  isModalOpen = signal<boolean>(false);
  authMode = signal<'login' | 'register'>('login');
  
  // Campos del formulario
  emailInput = '';
  passInput = '';
  nameInput = '';

  // UI
  cargando = signal<boolean>(false);
  isAlertOpen = signal<boolean>(false);
  toastOpen = signal<boolean>(false);
  toastMessage = signal<string>('');

  constructor() {
    addIcons({ person, logIn, personAdd, logOut, close, mail, lockClosed, happyOutline });
  }

  // Hook de Ionic: se ejecuta al entrar a la tab
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
    if (!this.emailInput || !this.passInput) {
      this.mostrarToast('Por favor, llena todos los campos.');
      return;
    }
    if (this.authMode() === 'register' && !this.nameInput) {
      this.mostrarToast('El nombre es obligatorio.');
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
      this.mostrarToast(`¡Bienvenido, ${loggedUser.name}!`);
      
    } catch (e) {
      console.error(e);
      this.mostrarToast('Error en la autenticación. Intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  confirmarLogout() {
    this.isAlertOpen.set(true);
  }

  async cerrarSesion() {
    try {
      await this.authPort.logout();
      this.user.set(null);
      this.mostrarToast('Sesión cerrada correctamente.');
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

  private mostrarToast(msg: string) {
    this.toastMessage.set(msg);
    this.toastOpen.set(true);
  }
}