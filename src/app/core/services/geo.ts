import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coordenada { lat: number; lng: number; }

@Injectable({ 
  providedIn: 'root' 
})
export class GeoService {
  private cache: Coordenada | null = null;

  async getCurrentPosition(): Promise<Coordenada> {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') await Geolocation.requestPermissions();

    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    this.cache = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    return this.cache;
  }

  getCache(): Coordenada | null { return this.cache; }

  distanciaMetros(a: Coordenada, b: Coordenada): number {
    const R = 6371e3;
    const φ1 = a.lat * Math.PI / 180, φ2 = b.lat * Math.PI / 180;
    const Δφ = (b.lat - a.lat) * Math.PI / 180;
    const Δλ = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  }

  formatearDistancia(m: number): string {
    return m < 1000 ? `${m.toFixed(0)} m` : `${(m/1000).toFixed(2)} km`;
  }

  async obtenerRuta(origen: Coordenada, destino: Coordenada): Promise<[number, number][]> {
    const url = `https://router.project-osrm.org/route/v1/foot/` +
      `${origen.lng},${origen.lat};${destino.lng},${destino.lat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error ' + res.status);
    const data = await res.json();
    if (!data.routes?.length) throw new Error('Sin ruta');
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );
  }
}