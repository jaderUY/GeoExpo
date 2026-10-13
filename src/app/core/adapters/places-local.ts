import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PlacesPort } from '../ports';
import { Lugar, CategoriaLugar } from '../models';

const KEY = 'geoexpo.places.v1';

@Injectable()
export class PlacesLocalAdapter implements PlacesPort {

  private cache: Lugar[] = [];
  private loaded = false;

  private async ensure() {
    if (this.loaded) return;
    const { value } = await Preferences.get({ key: KEY });
    this.cache = value ? JSON.parse(value) : SEED;
    this.loaded = true;
    if (!value) await this.persist();
  }

  private async persist() {
    await Preferences.set({ key: KEY, value: JSON.stringify(this.cache) });
  }

  async list(): Promise<Lugar[]> {
    await this.ensure();
    return [...this.cache];
  }

  async byId(id: string): Promise<Lugar | null> {
    await this.ensure();
    return this.cache.find(l => l.id === id) ?? null;
  }

  async create(data: Omit<Lugar, 'id' | 'createdAt'>): Promise<Lugar> {
    await this.ensure();
    const nuevo: Lugar = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.cache = [nuevo, ...this.cache];
    await this.persist();
    return nuevo;
  }

  async update(id: string, changes: Partial<Lugar>): Promise<Lugar> {
    await this.ensure();
    const idx = this.cache.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lugar no encontrado');
    this.cache[idx] = { ...this.cache[idx], ...changes, id };
    await this.persist();
    return this.cache[idx];
  }

  async remove(id: string): Promise<void> {
    await this.ensure();
    this.cache = this.cache.filter(l => l.id !== id);
    await this.persist();
  }

  async toggleGuardado(id: string): Promise<void> {
    await this.ensure();
    const idx = this.cache.findIndex(l => l.id === id);
    if (idx === -1) return;
    this.cache[idx] = { ...this.cache[idx], guardado: !this.cache[idx].guardado };
    await this.persist();
  }

  async listGuardados(): Promise<Lugar[]> {
    await this.ensure();
    return this.cache.filter(l => l.guardado);
  }

  async listByCategoria(cat: CategoriaLugar | 'todos'): Promise<Lugar[]> {
    await this.ensure();
    return cat === 'todos' ? [...this.cache] : this.cache.filter(l => l.categoria === cat);
  }
}

const SEED: Lugar[] = [
  {
    id: 'seed-1', nombre: 'Centro de Convenciones GeoExpo',
    categoria: 'exhibicion', lat: 4.60971, lng: -74.08175,
    comentario: 'Pabellón A · acceso principal',
    publico: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2', nombre: 'Espresso Lounge & Co-Work',
    categoria: 'cafe', lat: 4.6080, lng: -74.0792,
    comentario: 'Wi-Fi 300Mbps y enchufes dobles',
    publico: true, guardado: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-3', nombre: 'Trattoria del Porto',
    categoria: 'comida', lat: 4.6983, lng: -74.0410,
    comentario: 'Pasta fresca con trufa',
    publico: true, guardado: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-4', nombre: 'Punto de Encuentro B',
    categoria: 'encuentro', lat: 4.6115, lng: -74.0850,
    comentario: 'Zona de networking al aire libre',
    publico: true, createdAt: new Date().toISOString(),
  },
];

