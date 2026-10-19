import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonChip, IonLabel, IonIcon, IonToggle, IonButton, IonSpinner, IonToast, NavController, ViewWillEnter
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { camera, image, location, checkmarkCircle, close, refresh } from 'ionicons/icons';

// Core
import { PLACES_PORT } from '../../core/ports';
import { GeoService, Coordenada } from '../../core/services/geo';
import { PhotoService } from '../../core/services/photo';
import { CATEGORIAS, CategoriaLugar, Lugar } from '../../core/models';

@Component({
  selector: 'app-anadir',
  standalone: true,
  templateUrl: './anadir.page.html',
  styleUrls: ['./anadir.page.scss'],
  imports: [DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonChip, IonLabel, IonIcon, IonToggle, IonButton, IonSpinner, IonToast],
})
export class AnadirPage implements ViewWillEnter {
  private placesPort = inject(PLACES_PORT);
  private geo = inject(GeoService);
  private photoService = inject(PhotoService);
  private navCtrl = inject(NavController);
  private router = inject(Router);

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
  toastOpen = signal<boolean>(false);
  toastMessage = signal<string>('');

  categorias = CATEGORIAS;

  constructor() {
    addIcons({ camera, image, location, checkmarkCircle, close, refresh });
  }

  ionViewWillEnter() {
    // 1. Revisamos si venimos de un doble clic en el mapa
    const state = window.history.state;

    if (state && state.coords) {
      // Si hay coordenadas, las usamos y NO pedimos GPS
      this.ubicacion.set(state.coords);
      this.cargandoUbicacion.set(false);

      // Limpiamos el historial para que si el usuario cambia de pestaña
      // y vuelve manualmente a "Añadir", no se queden pegadas las viejas coordenadas.
      window.history.replaceState({}, '', window.location.href);
    } else {
      // Si entró normal a la pestaña, pedimos el GPS
      if (!this.ubicacion()) { // Solo si no hay una ubicación ya cargada
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
        this.mostrarToast('No se pudo obtener la ubicación. Revisa tus permisos.');
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
        // Ignoramos el error si el usuario cancela
      }
    }

    quitarFoto() {
      this.fotoUrl.set(null);
    }

    seleccionarCategoria(cat: CategoriaLugar) {
      this.categoria.set(cat);
    }

  async guardar() {
      if (!this.nombre().trim()) {
        this.mostrarToast('El nombre del sitio es obligatorio.');
        return;
      }
      const ubi = this.ubicacion();
      if (!ubi) {
        this.mostrarToast('Necesitamos tu ubicación para guardar el lugar.');
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
        };

        await this.placesPort.create(nuevoLugar);

        this.mostrarToast('¡Lugar añadido con éxito!');

        // Limpiar formulario
        this.limpiarFormulario();

        // Redirigir al mapa después de un breve delay para que se lea el toast
        setTimeout(() => {
          this.navCtrl.navigateForward('/tabs/mapa');
        }, 1500);

      } catch (e) {
        console.error(e);
        this.mostrarToast('Ocurrió un error al guardar.');
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

  private mostrarToast(msg: string) {
    this.toastMessage.set(msg);
    this.toastOpen.set(true);
  }
}