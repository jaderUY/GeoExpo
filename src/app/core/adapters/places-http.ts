import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlacesPort } from '../ports';
import { Lugar, CategoriaLugar } from '../models';
import { environment } from '../../../environments/environment';

@Injectable()
export class PlacesHttpAdapter implements PlacesPort {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/places`;

  list() { return firstValueFrom(this.http.get<Lugar[]>(this.base)); }
  byId(id: string) { return firstValueFrom(this.http.get<Lugar | null>(`${this.base}/${id}`)); }
  create(data: Omit<Lugar,'id'|'createdAt'>) {
    return firstValueFrom(this.http.post<Lugar>(this.base, data));
  }
  update(id: string, changes: Partial<Lugar>) {
    return firstValueFrom(this.http.patch<Lugar>(`${this.base}/${id}`, changes));
  }
  remove(id: string) { return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`)); }
  toggleGuardado(id: string) {
    return firstValueFrom(this.http.post<void>(`${this.base}/${id}/toggle-guardado`, {}));
  }
  listGuardados() { return firstValueFrom(this.http.get<Lugar[]>(`${this.base}?guardado=true`)); }
  listByCategoria(cat: CategoriaLugar | 'todos') {
    const q = cat === 'todos' ? '' : `?categoria=${cat}`;
    return firstValueFrom(this.http.get<Lugar[]>(`${this.base}${q}`));
  }
}