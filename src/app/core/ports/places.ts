import { InjectionToken } from '@angular/core';
import { Lugar, CategoriaLugar } from '../models';

export interface PlacesPort {
  list(): Promise<Lugar[]>;
  byId(id: string): Promise<Lugar | null>;
  create(data: Omit<Lugar, 'id' | 'createdAt'>): Promise<Lugar>;
  update(id: string, changes: Partial<Lugar>): Promise<Lugar>;
  remove(id: string): Promise<void>;
  toggleGuardado(id: string): Promise<void>;
  listGuardados(): Promise<Lugar[]>;
  listByCategoria(cat: CategoriaLugar | 'todos'): Promise<Lugar[]>;
}

export const PLACES_PORT = new InjectionToken<PlacesPort>('PLACES_PORT');

