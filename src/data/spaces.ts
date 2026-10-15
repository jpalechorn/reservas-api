export interface Space {
  id: number;
  name: string;
  capacity: number;
  location: string;
  type: string;
}

export const spaces: Space[] = [
  { id: 1, name: 'Auditorio Principal', capacity: 150, location: 'Bloque A', type: 'Auditorio' },
  { id: 2, name: 'Laboratorio de Software', capacity: 30, location: 'Bloque C', type: 'Laboratorio' },
  { id: 3, name: 'Cancha Sintética', capacity: 22, location: 'Zona Deportiva', type: 'Cancha' }
];