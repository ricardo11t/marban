export default class Race {
    constructor(name, bonus, pdd) {
        this.name = name; 
        this.bonus = bonus; 
        this.pdd = pdd;     
    }

    toClientJSON() {
        return {
            name: this.name,
            bonus: this.bonus,
            pdd: this.pdd,
        };
    }

    toPersistenceObject() {
        return {
            name: this.name,
            bonus: this.bonus, 
            pdd: this.pdd,     
        };
    }
}