import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonContent, IonChip, IonLabel, IonIcon, IonModal, IonButton, NavController} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { map as mapIcon, navigate, navigateCircle, cafe, restaurant, people, information, pricetag, sparkles, close, add, location, checkmarkCircle } from 'ionicons/icons';
import * as L from 'leaflet';

import { PLACES_PORT } from '../../core/ports';
import { GeoService, Coordenada } from '../../core/services/geo';
import { CATEGORIAS, CategoriaLugar, Lugar } from '../../core/models';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ IonChip, IonLabel, IonIcon, IonModal, IonButton, IonContent],
  host: { class: 'ion-page'},
})
export class MapaPage implements AfterViewInit, OnDestroy {

  // IDE: Inyección de dependencias
  private placesPort = inject(PLACES_PORT);
  private geo = inject(GeoService);
  private navCtrl = inject(NavController);

  // referencia al contenedor del mapa
  @ViewChild('mapContainer', { static: false })
  mapContainer!: ElementRef<HTMLDivElement>;

  // estado con signals
  private leafletMap!: L.Map;
  private markersLayer = L.layerGroup();
  private rutaLayer?: L.Polyline;
  private markerUsuario?: L.Marker;
  private iconoUsuario!: L.DivIcon;

  lugares = signal<Lugar[]>([]);
  categoriaActiva = signal<CategoriaLugar | 'todos'>('todos');
  ubicacionUsuario = signal<Coordenada | null>(null);
  lugarSeleccionado = signal<Lugar | null>(null);
  isSheetOpen = signal(false);

  categorias = CATEGORIAS;

  lugaresFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    const lista = this.lugares();
    return cat === 'todos' ? lista : lista.filter(l => l.categoria === cat);
  });

  // Icono de marcador según la categoría del lugar
  private iconoPorCategoria(cat: CategoriaLugar): L.DivIcon {
    const meta = CATEGORIAS.find(c => c.key === cat)!;
    return L.divIcon({
      className: 'geoexpo-marker',
      html: `
        <div class="marker-pin marker-${meta.key}">
          <ion-icon name="${meta.icon}"></ion-icon>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }

  constructor() {
    addIcons({
      mapIcon,
      navigate,
      navigateCircle,
      cafe,
      restaurant,
      people,
      information,
      pricetag,
      sparkles,
      close,
      add,
      location,
      checkmarkCircle,
    });
  }

  // Ciclo de vida: inicialización y destrucción del mapa
  async ngAfterViewInit() {
    const lista = await this.placesPort.list();
    this.lugares.set(lista);

    try {
      const coord = await this.geo.getCurrentPosition();
      this.ubicacionUsuario.set(coord);
    } catch (e) {
      console.warn('No se pudo obtener la ubicación', e);
    }

    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy() {
    this.leafletMap?.remove();
  }

  // inicialización del mapa: Leaflet, capa de marcadores y marcador de usuario
  private initMap() {
    const ubi = this.ubicacionUsuario();
    const center: [number, number] = ubi
      ? [ubi.lat, ubi.lng]
      : [4.60971, -74.08175];

    this.leafletMap = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: true,
    }).setView(center, 16);

    this.leafletMap.on('dblclick', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Navegamos a la pestaña Añadir pasando las coordenadas
      this.navCtrl.navigateForward('/tabs/anadir', {
        state: { coords: { lat, lng } }
      });
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.leafletMap);

    this.markersLayer.addTo(this.leafletMap);

    this.iconoUsuario = L.divIcon({
      className: 'geoexpo-user',
      html: `<div class="user-pulse"><span></span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    if (ubi) {
      this.markerUsuario = L.marker([ubi.lat, ubi.lng], { icon: this.iconoUsuario })
        .addTo(this.leafletMap)
        .bindPopup('Estás aquí 📍');
    }

    this.markersLayer.addTo(this.leafletMap);
    this.renderMarkers();

    setTimeout(() => this.leafletMap.invalidateSize(), 150);
  }

  // renderizado de marcadores: limpiar y volver a dibujar según la categoría activa
  private renderMarkers() {
    this.markersLayer.clearLayers();

    this.lugaresFiltrados().forEach(lugar => {
      const marker = L.marker([lugar.lat, lugar.lng], {
        icon: this.iconoPorCategoria(lugar.categoria),
      });

      marker.on('click', () => this.abrirDetalle(lugar));
      marker.addTo(this.markersLayer);
    });
  }

  // selección de categoría: filtrar lugares por categoría
  seleccionarCategoria(cat: CategoriaLugar | 'todos') {
    this.categoriaActiva.set(cat);
    this.renderMarkers();
  }

  // bottom sheet: abrir/cerrar detalle de lugar
  abrirDetalle(lugar: Lugar) {
    this.lugarSeleccionado.set(lugar);
    this.isSheetOpen.set(true);
  }

  cerrarDetalle() {
    this.isSheetOpen.set(false);
    this.lugarSeleccionado.set(null);
  }

  //  FAB: centrar en la ubicación del usuario
  async centrarEnMiUbicacion() {
    try {
      const coord = await this.geo.getCurrentPosition();
      this.ubicacionUsuario.set(coord);
      this.leafletMap.flyTo([coord.lat, coord.lng], 17, { duration: 0.8 });

      if (this.markerUsuario) {
        this.markerUsuario.setLatLng([coord.lat, coord.lng]);
      } else {
        this.markerUsuario = L.marker([coord.lat, coord.lng], { icon: this.iconoUsuario })
          .addTo(this.leafletMap)
          .bindPopup('Estás aquí 📍');
      }
    } catch (e) {
      console.error('Error obteniendo ubicación', e);
    }
  }

  // FAB: trazar ruta al lugar seleccionado
  async trazarRutaAlSeleccionado() {
    const destino = this.lugarSeleccionado();
    const origen = this.ubicacionUsuario();
    if (!destino || !origen) return;

    try {
      const coords = await this.geo.obtenerRuta(origen, {
        lat: destino.lat,
        lng: destino.lng,
      });

      if (this.rutaLayer) this.leafletMap.removeLayer(this.rutaLayer);

      this.rutaLayer = L.polyline(coords, {
        color: '#0056c4',
        weight: 5,
        opacity: 0.85,
      }).addTo(this.leafletMap);

      this.leafletMap.fitBounds(this.rutaLayer.getBounds(), { padding: [60, 60] });
      this.cerrarDetalle();
    } catch (e) {
      console.error('Error trazando ruta', e);
    }
  }

  // Helpers para la vista
  iconoDeCategoria(cat: CategoriaLugar): string {
    return CATEGORIAS.find(c => c.key === cat)?.icon ?? 'pricetag';
  }

  labelDeCategoria(cat: CategoriaLugar): string {
    return CATEGORIAS.find(c => c.key === cat)?.label ?? 'Otro';
  }

  distanciaTexto(lugar: Lugar): string {
    const u = this.ubicacionUsuario();
    if (!u) return '';
    const m = this.geo.distanciaMetros(u, { lat: lugar.lat, lng: lugar.lng });
    return this.geo.formatearDistancia(m);
  }

  formatearCoordenadas(lugar: Lugar): string {
    const lat = lugar.lat.toFixed(4) + '° N';
    const lng = Math.abs(lugar.lng).toFixed(4) + '° O';
    return `Lat: ${lat} · Lng: ${lng}`;
  }
}