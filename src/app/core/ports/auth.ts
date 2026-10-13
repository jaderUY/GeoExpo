import { InjectionToken } from '@angular/core';
import { Usuario } from '../models';

export interface AuthPort {
  currentUser(): Promise<Usuario | null>;
  login(email: string, password: string): Promise<Usuario>;
  register(name: string, email: string, password: string): Promise<Usuario>;
  logout(): Promise<void>;
}

export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');