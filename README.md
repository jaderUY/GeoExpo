# GeoExpo

GeoExpo es una aplicación móvil/web construida con Ionic, Angular y Capacitor para explorar, crear y guardar lugares de una exposición sobre un mapa interactivo.

## Funcionalidades

- Explorar lugares en un mapa Leaflet con datos de OpenStreetMap.
- Filtrar lugares por categoría y consultar sus detalles.
- Obtener la ubicación actual del dispositivo.
- Calcular rutas a pie mediante OSRM.
- Añadir lugares con nombre, categoría, descripción, ubicación y foto.
- Guardar lugares para consultarlos en otra pestaña.
- Usar la cámara o galería desde dispositivos compatibles.
- Mostrar notificaciones locales.
- Navegar entre Mapa, Guardados, Añadir y Perfil.

## Requisitos

- Node.js y npm, en versiones compatibles con Angular 22.
- Un servidor PocketBase para las funciones de lugares.
- Para ejecutar la aplicación como Android: Android Studio y las herramientas de Android SDK.

## Instalación y ejecución web

Desde la raíz del proyecto:

```bash
npm install
npm start
```

La aplicación se sirve en `http://localhost:4200`. También puede iniciarse con Ionic:

```bash
npx ionic serve
```

## PocketBase

La aplicación usa `PlacesPocketBaseAdapter` como implementación activa para lugares. Por defecto, el adaptador intenta conectarse a PocketBase en:

```text
http://127.0.0.1:8090
```

Si PocketBase se ejecuta en otro equipo o dentro de un dispositivo móvil, configura la URL del servidor para que sea accesible desde ese entorno. `127.0.0.1` dentro de un teléfono apunta al propio teléfono, no al ordenador de desarrollo.

La colección `places` debe incluir estos campos:

| Campo | Tipo sugerido | Uso |
|---|---|---|
| `name` | Texto | Nombre del lugar |
| `categoria` | Texto | Categoría del lugar |
| `lat` | Número | Latitud |
| `lng` | Número | Longitud |
| `comentario` | Texto | Descripción opcional |
| `publico` | Booleano | Visibilidad del lugar |
| `guardado` | Booleano | Estado de guardado |
| `foto` | Archivo | Imagen opcional |

PocketBase también debe proporcionar los campos de sistema, como `id` y `created`.

> **Seguridad:** no guardes credenciales de administrador ni secretos en el código del cliente. El adaptador de PocketBase debe autenticarse con permisos limitados y reglas adecuadas; cualquier credencial que ya se haya expuesto en el repositorio debe rotarse y retirarse del código.

Los proveedores se seleccionan en `src/app/core/providers/data.ts`. El proveedor de autenticación activo es `AuthLocalAdapter`: guarda un perfil en las preferencias del dispositivo y sirve como flujo de demostración, no como autenticación segura de producción. Los adaptadores HTTP alternativos están en el código, pero no son los proveedores activos.

## Ejecutar en Android

Con Android Studio y el SDK instalados:

```bash
npx cap sync android
npx cap open android
```

Desde Android Studio, selecciona un emulador o dispositivo configurado y ejecuta la aplicación. La geolocalización y la cámara requieren permisos del sistema. Para probar en un dispositivo real, verifica que este pueda acceder a la URL configurada de PocketBase.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo Angular |
| `npm run build` | Compila la aplicación |
| `npm run watch` | Compila en modo desarrollo y observa cambios |
| `npm test` | Ejecuta las pruebas configuradas |
| `npm run lint` | Ejecuta el análisis estático |

## Servicios externos

- **OpenStreetMap:** mosaicos y atribución cartográfica.
- **OSRM:** cálculo de rutas a pie.
- **PocketBase:** almacenamiento remoto de lugares.
- **Capacitor:** acceso a geolocalización, cámara, preferencias y notificaciones del dispositivo.

El mapa, las rutas y los datos remotos dependen de conectividad y de la disponibilidad de los servicios correspondientes.
