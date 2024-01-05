import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

export const uuid = (prefix?: string) => {
    return (prefix || "") + uuidv4();
}

export const ID = (prefix?: string) => {
    return (prefix || "") + nanoid();
}

export const encode = () => { }

// [分类]-数据id
export const IDDecode = (id: string) => {
    return id.replace(/\[.*\]-/, "")
}