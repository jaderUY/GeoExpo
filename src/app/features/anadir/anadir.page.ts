import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonChip, IonLabel, IonIcon, IonToggle, IonButton, IonSpinner, NavController, ViewWillEnter 
} from '@ionic/angular'; // <-- Recomiendo usar standalone aquí también
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { camera, image, location, checkmarkCircle, close, refresh } from 'ionicons/icons';

// Core
import { PLACES_PORT } from '../../core/ports';
import { GeoService, Coordenada } from '../../core/services/geo';
import { PhotoService } from '../../core/services/photo';
import { CATEGORIAS, CategoriaLugar, Lugar } from '../../core/models';
import { LocalNotificationsService } from '../../core/services/local-notifications';

@Component({
  selector: 'app-anadir',
  standalone: true,
  templateUrl: './anadir.page.html',
  styleUrls: ['./anadir.page.scss'],
  imports: [DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonChip, IonLabel, IonIcon, IonToggle, IonButton, IonSpinner],
})
export class AnadirPage implements ViewWillEnter {

  private placesPort = inject(PLACES_PORT);
  private geo = inject(GeoService);
  private photoService = inject(PhotoService);
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private notif = inject(LocalNotificationsService);

  // ── Estado del formulario ─────────────────────────
  nombre = signal<string>('');
  categoria = signal<CategoriaLugar>('exhibicion');
  comentario = signal<string>('');
  publico = signal<boolean>(true);

  // Foto y ubicación
  fotoUrl = signal<string | null>(null);
  ubicacion = signal<Coordenada | null>(null);
  cargandoUbicacion = signal<boolean>(true);

  // UI
  guardando = signal<boolean>(false);
  categorias = CATEGORIAS;

  constructor() {
    addIcons({ camera, image, location, checkmarkCircle, close, refresh });
  }

  ionViewWillEnter() {
    const state = window.history.state;

    if (state && state.coords) {
      this.ubicacion.set(state.coords);
      this.cargandoUbicacion.set(false);
      window.history.replaceState({}, '', window.location.href);
    } else {
      if (!this.ubicacion()) {
        this.obtenerUbicacion();
      }
    }
  }

  // ── Lógica ────────────────────────────────────────
  async obtenerUbicacion() {
    this.cargandoUbicacion.set(true);
    try {
      const coords = await this.geo.getCurrentPosition();
      this.ubicacion.set(coords);
    } catch (e) {
      // Notificación local en caso de error de GPS
      await this.notif.scheduleIn(1, 'Error de GPS', 'No se pudo obtener la ubicación. Revisa tus permisos.');
    } finally {
      this.cargandoUbicacion.set(false);
    }
  }

  async tomarFoto() {
    try {
      const photo = await this.photoService.takePhoto();
      if (photo.source) {
        this.fotoUrl.set(photo.source);
      }
    } catch (e) {
      console.error('Error tomando foto', e);
    }
  }

  quitarFoto() {
    this.fotoUrl.set(null);
  }

  seleccionarCategoria(cat: CategoriaLugar) {
    this.categoria.set(cat);
  }

  async guardar() {
    // 1. Validaciones con notificaciones locales
    if (!this.nombre().trim()) {
      await this.notif.scheduleIn(1, 'Falta Información', 'El nombre del sitio es obligatorio.');
      return;
    }
    const ubi = this.ubicacion();
    if (!ubi) {
      await this.notif.scheduleIn(1, 'Falta Ubicación', 'Necesitamos tu ubicación para guardar el lugar.');
      return;
    }

    this.guardando.set(true);
    try {
      const nuevoLugar: Omit<Lugar, 'id' | 'createdAt'> = {
        nombre: this.nombre().trim(),
        categoria: this.categoria(),
        lat: ubi.lat,
        lng: ubi.lng,
        fotoUrl: this.fotoUrl() || undefined,
        comentario: this.comentario().trim(),
        publico: this.publico(),
        guardado: true
      };

      await this.placesPort.create(nuevoLugar);

      // 2. Notificación de éxito
      await this.notif.scheduleIn(1, '¡Lugar Añadido!', `El sitio "${nuevoLugar.nombre}" se guardó correctamente.`);

      // Limpiar formulario
      this.limpiarFormulario();

      // Redirigir al mapa después de un breve delay
      setTimeout(() => {
        this.navCtrl.navigateForward('/tabs/mapa');
      }, 1500);

    } catch (e) {
      console.error(e);
      // 3. Notificación de error al guardar
      await this.notif.scheduleIn(1, 'Error', 'Ocurrió un error al intentar guardar el lugar.');
    } finally {
      this.guardando.set(false);
    }
  }

  // ── Helpers ───────────────────────────────────────
  private limpiarFormulario() {
    this.nombre.set('');
    this.categoria.set('exhibicion');
    this.comentario.set('');
    this.fotoUrl.set(null);
    this.publico.set(true);
  }
}