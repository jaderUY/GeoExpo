import { Provider } from '@angular/core';
import { PLACES_PORT, AUTH_PORT } from '../tokens/data';
import { AuthLocalAdapter } from '../adapters/auth-local';
import { PlacesPocketBaseAdapter } from '../adapters/places-pocketbase.adapter';
// import { PlacesHttpAdapter } from '../adapters/places-http';
// import { AuthHttpAdapter } from '../adapters/auth-http';
// import { PlacesLocalAdapter } from '../adapters/places-local';

/**
 * Cuando tengas la API real, solo cambia useClass aquí.
 * Los componentes no se enteran.
 */
export const DATA_PROVIDERS: Provider[] = [
  { provide: PLACES_PORT, useClass: PlacesPocketBaseAdapter }, 
  { provide: AUTH_PORT,   useClass: AuthLocalAdapter },
];