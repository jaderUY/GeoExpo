import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButton, IonModal, IonAlert, IonToast,
  NavController,
  ViewWillEnter, // Hook de Ionic
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookmark, navigate as navigation, trash, close, location, mapOutline
} from 'ionicons/icons';

import { PLACES_PORT } from '../../core/ports';
import { CATEGORIAS, Lugar } from '../../core/models';

@Component({
  selector: 'app-guardados',
  standalone: true,
  templateUrl: './guardados.page.html',
  styleUrls: ['./guardados.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButton, IonModal, IonAlert, IonToast, DecimalPipe,
  ],
  host: { class: 'ion-page' }, // Regla de oro
})
export class GuardadosPage implements ViewWillEnter {
  private placesPort = inject(PLACES_PORT);
  private navCtrl = inject(NavController);

  // ── Estado ────────────────────────────────────────
  lugares = signal<Lugar[]>([]);
  lugarSeleccionado = signal<Lugar | null>(null);
  
  isModalOpen = signal<boolean>(false);
  isAlertOpen = signal<boolean>(false);
  toastOpen = signal<boolean>(false);
  toastMessage = signal<string>('');

  constructor() {
    addIcons({ bookmark, navigation, trash, close, location, mapOutline });
  }

  // Se ejecuta cada vez que el usuario entra a esta tab
  async ionViewWillEnter() {
    await this.cargarGuardados();
  }

  async cargarGuardados() {
    try {
      const res = await this.placesPort.listGuardados();
      this.lugares.set(res);
    } catch (e) {
      console.error('Error cargando guardados', e);
    }
  }

  // ── Lógica del Modal (Detalle) ────────────────────
  abrirDetalle(lugar: Lugar) {
    this.lugarSeleccionado.set(lugar);
    this.isModalOpen.set(true);
  }

  cerrarDetalle() {
    this.isModalOpen.set(false);
    this.lugarSeleccionado.set(null);
  }

  // ── Lógica de Eliminación ─────────────────────────
  confirmarEliminar() {
    this.isAlertOpen.set(true);
  }

  async eliminarLugar() {
    const lugar = this.lugarSeleccionado();
    if (!lugar) return;

    try {
      // En este caso, "eliminar de guardados" significa quitar el flag
      await this.placesPort.toggleGuardado(lugar.id);
      this.cerrarDetalle();
      await this.cargarGuardados(); // Recargar lista
      this.mostrarToast('Lugar eliminado de guardados');
    } catch (e) {
      console.error(e);
      this.mostrarToast('Error al eliminar');
    }
  }

  // ── Helpers ───────────────────────────────────────
  irAlMapa(lugar: Lugar) {
    // Aquí podrías pasar el ID por URL si quisieras centrar el mapa
    this.navCtrl.navigateForward('/tabs/mapa');
    this.cerrarDetalle();
  }

  labelDeCategoria(cat: string): string {
    return CATEGORIAS.find(c => c.key === cat)?.label ?? 'Otro';
  }

  iconoDeCategoria(cat: string): string {
    return CATEGORIAS.find(c => c.key === cat)?.icon ?? 'pricetag';
  }

  private mostrarToast(msg: string) {
    this.toastMessage.set(msg);
    this.toastOpen.set(true);
  }
}
