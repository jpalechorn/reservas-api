import { Space, spaces } from '../data/spaces';

let nextId = 4;

export function listSpaces(): Space[] {
  return spaces;
}

export function findSpaceById(id: number): Space | undefined {
  return spaces.find((s) => s.id === id);
}

export function createSpace(data: Omit<Space, 'id'>): Space {
  const newSpace: Space = { id: nextId++, ...data };
  spaces.push(newSpace);
  return newSpace;
}

export function updateSpace(id: number, data: Partial<Omit<Space, 'id'>>): Space | undefined {
  const space = findSpaceById(id);
  if (!space) return undefined;

  if (data.name !== undefined) space.name = data.name;
  if (data.capacity !== undefined) space.capacity = data.capacity;
  if (data.location !== undefined) space.location = data.location;
  if (data.type !== undefined) space.type = data.type;

  return space;
}

export function deleteSpace(id: number): boolean {
  const index = spaces.findIndex((s) => s.id === id);
  if (index === -1) return false;
  spaces.splice(index, 1);
  return true;
}