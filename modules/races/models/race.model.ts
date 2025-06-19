// 1. Defina uma interface para as propriedades da raça
export interface IRace {
    name: string;
    bonus: object;
    pdd: object;
}

export default class Race implements IRace {
    public name: string;
    public bonus: object;
    public pdd: object;

    constructor(name: string, bonus: object, pdd: object) { // Tipado os parâmetros do construtor
        // Opcional: Adicionar validações básicas

        this.name = name;
        this.bonus = bonus;
        this.pdd = pdd;
    }

    /**
     * Retorna uma representação da raça segura para ser enviada ao cliente.
     * Neste caso, retorna todas as propriedades, pois não há dados sensíveis.
     * @returns Um objeto com dados da raça para o cliente.
     */
    toClientJSON(): IRace { // O tipo de retorno é a própria interface IRace
        return {
            name: this.name,
            bonus: this.bonus,
            pdd: this.pdd,
        };
    }

    /**
     * Retorna uma representação da raça para persistência no banco de dados.
     * Neste caso, é idêntico a toClientJSON, mas serve para desacoplar a lógica.
     * @returns Um objeto com dados da raça para persistência.
     */
    toPersistenceObject(): IRace { // O tipo de retorno é a própria interface IRace
        return {
            name: this.name,
            bonus: this.bonus,
            pdd: this.pdd,
        };
    }
}