import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

export const uuid = (prefix?: string) => {
    return (prefix || "") + uuidv4();
}

export const ID = (prefix?: string) => {
    return (prefix || "") + nanoid();
}