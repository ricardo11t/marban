export interface IQdrantPoint {
    id: number | string;
    vector: number[];
    payload?: Record<string, any> | null;
}

// CORREÇÃO AQUI: Garanta que ILoreDocument é exportado de forma nomeada
export interface ILoreDocument { // <--- Adicione 'export' aqui
    id?: number | string;
    text: string;
    metadata?: Record<string, any>;
}

export default class QdrantModel implements IQdrantPoint {
    public id: number | string;
    public vector: number[];
    public payload: Record<string, any> | null;

    constructor(id: number | string, vector: number[], payload: Record<string, any> | null = null) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new Error('ID must be a number or a string');
        }
        if (!Array.isArray(vector) || !vector.every(num => typeof num === 'number')) {
            throw new Error('Vector must be an array of numbers');
        }
        if (payload !== null && typeof payload !== 'object') {
            throw new Error('Payload must be an object or null');
        }

        this.id = id;
        this.vector = vector;
        this.payload = payload;
    }

    toQdrantPoint(): IQdrantPoint {
        return {
            id: this.id,
            vector: this.vector,
            payload: this.payload,
        };
    }
}