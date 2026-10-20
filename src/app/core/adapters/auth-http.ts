import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthPort } from '../ports';
import { Usuario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthHttpAdapter implements AuthPort {
  private http = inject(HttpClient);
  private base = `${environment.production}/auth`; //aqui en realidad va environment.production

  currentUser() {
    return firstValueFrom(this.http.get<Usuario | null>(`${this.base}/me`));
  }
  login(email: string, password: string) {
    return firstValueFrom(this.http.post<Usuario>(`${this.base}/login`, { email, password }));
  }
  register(name: string, email: string, password: string) {
    return firstValueFrom(this.http.post<Usuario>(`${this.base}/register`, { name, email, password }));
  }
  logout() { return firstValueFrom(this.http.post<void>(`${this.base}/logout`, {})); }
}

