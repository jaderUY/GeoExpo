import { EnvironmentProviders, Provider } from '@angular/core';
import { PLACES_PORT, AUTH_PORT } from '../tokens/data';
import { PlacesLocalAdapter } from '../adapters/places-local';
import { AuthLocalAdapter } from '../adapters/auth-local';
// import { PlacesHttpAdapter } from '../adapters/places-http';
// import { AuthHttpAdapter } from '../adapters/auth-http';

/**
 * Cuando tengas la API real, solo cambia useClass aquí.
 * Los componentes no se enteran.
 */
export const DATA_PROVIDERS: Provider[] = [
  { provide: PLACES_PORT, useClass: PlacesLocalAdapter },
  { provide: AUTH_PORT,   useClass: AuthLocalAdapter },
  // { provide: PLACES_PORT, useClass: PlacesHttpAdapter },
  // { provide: AUTH_PORT,   useClass: AuthHttpAdapter },
];