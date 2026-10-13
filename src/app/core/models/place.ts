export type CategoriaLugar = 'exhibicion' | 'cafe' | 'comida' | 'encuentro' | 'servicios' | 'otro';

export interface Lugar {
    id: string;
    nombre: string;
    categoria: CategoriaLugar;
    lat: number;
    lng: number;
    fotoUrl?: string;
    comentario?: string;
    publico: boolean;
    guardado?: boolean;
    creadoPor?: string;
    createdAt: string;
}

export interface CategoriaMeta {
  key: CategoriaLugar;
  label: string;
  icon: string;   // ionicon
  color: string;
}

export const CATEGORIAS: CategoriaMeta[] = [
  { key: 'exhibicion', label: 'Exhibición', icon: 'sparkles',    color: 'primary'   },
  { key: 'cafe',       label: 'Café',       icon: 'cafe',        color: 'tertiary'  },
  { key: 'comida',     label: 'Comida',     icon: 'restaurant',  color: 'tertiary'  },
  { key: 'encuentro',  label: 'Encuentro',  icon: 'people',      color: 'secondary' },
  { key: 'servicios',  label: 'Servicios',  icon: 'information', color: 'medium'    },
  { key: 'otro',       label: 'Otro',       icon: 'pricetag',    color: 'medium'    },
];

