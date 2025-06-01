export default class ClassModel {
    constructor({ name, bonus, tipo }) {
        this.name = name;
        this.bonus = bonus;
        this.tipo = tipo;
    }

    toClientJSON() {
        return {
            name: this.name,
            bonus: this.bonus,
            tipo: this.tipo,
        };
    }

    toPersistenceObject() {
        return {
            name: this.name,
            bonus: this.bonus,
            tipo: this.tipo,
        };
    }
}