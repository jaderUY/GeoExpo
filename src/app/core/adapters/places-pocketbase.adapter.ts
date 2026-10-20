import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { PlacesPort } from '../ports';
import { Lugar, CategoriaLugar } from '../models';

@Injectable()
export class PlacesPocketBaseAdapter implements PlacesPort {
    // 1. Inicialización del SDK.
    // Apunta a la URL de tu servidor PocketBase local.
    private pb = new PocketBase('http://127.0.0.1:8090');

    // Nombre de la colección en PocketBase
    private readonly COLLECTION = 'places';

    constructor() {
        // Opcional: Deshabilitar la autocancelación para evitar errores si se hacen peticiones simultáneas.
        this.pb.autoCancellation(false);


        const adminEmail = 'jaderdavidaraujoarboleda@gmail.com';
        const adminPass = 'Baldur$038';

        this.pb.collection('_superusers').authWithPassword(adminEmail, adminPass)
            .then(() => console.log('Conectado a PocketBase como Superusuario (Bypass de reglas)'))
            .catch(err => console.error('Error de autenticación Admin:', err));
    }

    // Obtiene la lista completa de lugares.
    async list(): Promise<Lugar[]> {
        try {
            const records = await this.pb.collection(this.COLLECTION).getFullList();
            return records.map((record) => this.mapRecordToLugar(record));
        } catch (error) {
            console.error('Error al listar lugares desde PocketBase:', error);
            return [];
        }
    }

    /**
     * Busca un lugar por su ID.
     */
    async byId(id: string): Promise<Lugar | null> {
        try {
            const record = await this.pb.collection(this.COLLECTION).getOne(id);
            return this.mapRecordToLugar(record);
        } catch (error) {
            console.error(`Error al buscar el lugar con ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Crea un nuevo lugar. Aquí es donde manejamos la subida de la foto.
     */
    async create(data: Omit<Lugar, 'id' | 'createdAt'>): Promise<Lugar> {
        // 1. Preparamos los datos para PocketBase.
        // PocketBase espera un objeto plano (FormData o JSON). Para archivos, usamos FormData.
        const formData = new FormData();

        // Mapeamos los campos del modelo Lugar a los campos de la colección.
        formData.append('name', data.nombre);
        formData.append('categoria', data.categoria);
        formData.append('lat', data.lat.toString());
        formData.append('lng', data.lng.toString());
        formData.append('comentario', data.comentario || '');
        formData.append('publico', String(data.publico));
        formData.append('guardado', String(data.guardado ?? false));

        // 2. Manejo de la foto: si existe una fotoUrl, significa que es un webPath (Blob).
        // Necesitamos convertir esa URL a un Blob para subirla.
        if (data.fotoUrl) {
            try {
                const response = await fetch(data.fotoUrl);
                const blob = await response.blob();
                // 'foto' es el nombre del campo File en la colección de PocketBase.
                // 'foto.jpg' es el nombre con el que se guardará en el servidor.
                formData.append('foto', blob, 'foto.jpg');
            } catch (error) {
                console.error('Error al procesar la imagen para subir:', error);
                // Si falla la subida de la foto, el lugar se creará sin ella.
            }
        }

        // 3. Creamos el registro en PocketBase.
        // NOTA: El campo 'owner' se llena automáticamente si el usuario está autenticado 

        const record = await this.pb.collection(this.COLLECTION).create(formData);
        return this.mapRecordToLugar(record);
    }

    /**
     * Actualiza un lugar existente.
     */
    async update(id: string, changes: Partial<Lugar>): Promise<Lugar> {
        const formData = new FormData();

        // Solo agregamos los campos que vienen en 'changes'.
        if (changes.nombre !== undefined) formData.append('name', changes.nombre);
        if (changes.categoria !== undefined) formData.append('categoria', changes.categoria);
        if (changes.lat !== undefined) formData.append('lat', changes.lat.toString());
        if (changes.lng !== undefined) formData.append('lng', changes.lng.toString());
        if (changes.comentario !== undefined) formData.append('comentario', changes.comentario);
        if (changes.publico !== undefined) formData.append('publico', String(changes.publico));
        if (changes.guardado !== undefined) formData.append('guardado', String(changes.guardado));

        // Si se envía una nueva foto, la manejamos igual que en create.
        if (changes.fotoUrl) {
            try {
                const response = await fetch(changes.fotoUrl);
                const blob = await response.blob();
                formData.append('foto', blob, 'foto.jpg');
            } catch (error) {
                console.error('Error al actualizar la imagen:', error);
            }
        }

        const record = await this.pb.collection(this.COLLECTION).update(id, formData);
        return this.mapRecordToLugar(record);
    }

    /**
     * Elimina un lugar.
     */
    async remove(id: string): Promise<void> {
        await this.pb.collection(this.COLLECTION).delete(id);
    }

    /**
     * Alterna el estado de "guardado" de un lugar.
     */
    async toggleGuardado(id: string): Promise<void> {
        // 1. Obtenemos el registro actual.
        const record = await this.pb.collection(this.COLLECTION).getOne(id);
        // 2. Invertimos el valor y actualizamos.
        await this.pb.collection(this.COLLECTION).update(id, {
            guardado: !record['guardado']
        });
    }

    /**
     * Lista solo los lugares guardados.
     */
    async listGuardados(): Promise<Lugar[]> {
        try {
            const records = await this.pb.collection(this.COLLECTION).getFullList();
            return records.map((record) => this.mapRecordToLugar(record));
        } catch (error) {
            console.error('Error al listar lugares desde PocketBase:', error);
            return [];
        }
    }

    /**
     * Lista lugares por categoría.
     */
    async listByCategoria(cat: CategoriaLugar | 'todos'): Promise<Lugar[]> {
        try {
            const filter = cat === 'todos' ? '' : `categoria = "${cat}"`;
            const records = await this.pb.collection(this.COLLECTION).getFullList({
                filter: filter || undefined // Si no hay filtro, pasamos undefined.
            });
            return records.map(this.mapRecordToLugar);
        } catch (error) {
            console.error(`Error al listar por categoría ${cat}:`, error);
            return [];
        }
    }

    /**
     * Transforma un registro crudo de PocketBase a tu modelo de dominio 'Lugar'.
     */
    private mapRecordToLugar(record: any): Lugar {
        return {
            id: record.id,
            nombre: record.name, // Mapeo de 'name' (PB) a 'nombre' (Modelo)
            categoria: record.categoria as CategoriaLugar,
            lat: Number(record.lat),
            lng: Number(record.lng),
            // Si el registro tiene foto, generamos la URL completa usando el SDK.
            fotoUrl: record.foto ? this.pb.files.getURL(record, record.foto) : undefined,
            comentario: record.comentario,
            publico: Boolean(record.publico),
            guardado: Boolean(record.guardado),
            createdAt: record.created,
            // Si tienes un campo de relación 'owner', puedes mapearlo aquí si lo necesitas.
            // creadoPor: record.owner,
        };
    }
}