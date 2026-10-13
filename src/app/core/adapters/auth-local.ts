import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthPort } from '../ports';
import { Usuario } from '../models';

const KEY = 'geoexpo.user.v1';

@Injectable()
export class AuthLocalAdapter implements AuthPort {

  async currentUser(): Promise<Usuario | null> {
    const { value } = await Preferences.get({ key: KEY });
    return value ? JSON.parse(value) : null;
  }

  async login(email: string, _password: string): Promise<Usuario> {
    const user: Usuario = {
      uid: 'local-' + btoa(email),
      name: email.split('@')[0] || 'Usuario',
      email,
      createdAt: new Date().toISOString(),
    };
    await Preferences.set({ key: KEY, value: JSON.stringify(user) });
    return user;
  }

  async register(name: string, email: string, _password: string): Promise<Usuario> {
    const user: Usuario = {
      uid: crypto.randomUUID(),
      name, email,
      createdAt: new Date().toISOString(),
    };
    await Preferences.set({ key: KEY, value: JSON.stringify(user) });
    return user;
  }

  async logout(): Promise<void> {
    await Preferences.remove({ key: KEY });
  }
}

