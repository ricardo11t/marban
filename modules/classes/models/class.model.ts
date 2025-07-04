// src/modules/classes/models/class.model.ts

export interface IClass {
    name: string;
    bonus: object; // Pode ser mais específico se souber a estrutura
    tipo: object;  // Pode ser mais específico se souber a estrutura
}

export default class ClassModel implements IClass {
    public name: string;
    public bonus: object;
    public tipo: object;

    constructor(name: string, bonus: object, tipo: object) {
        this.name = name;
        this.bonus = bonus;
        this.tipo = tipo;
    }

    toClientJSON(): IClass {
        return {
            name: this.name,
            bonus: this.bonus,
            tipo: this.tipo,
        };
    }

    toPersistenceObject(): IClass {
        return {
            name: this.name,
            bonus: this.bonus,
            tipo: this.tipo,
        };
    }
}