export default class QdrantModel {
    public id: number | string;
    public vector: string;
    public payload: Record<string, any> | null;

    constructor( id: number | string, vector: string, payload: Record<string, any> | null ) {
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new Error('ID must be a number or a string');
        }
        if (typeof vector !== 'string') {
            throw new Error('Vector must be a string');
        }
        if (payload !== null && typeof payload !== 'object') {
            throw new Error('Payload must be an object or null');
        }
        this.id = id;
        this.vector = vector;
        this.payload = payload;
    }

    toClientJSON() {
        return {
            id: this.id,
            vector: this.vector,
            payload: this.payload,
        };
    }
}