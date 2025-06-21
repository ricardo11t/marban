// 1. A interface (correta e mantida como a "fonte da verdade")
export interface IRace {
    name: string;
    raceData: {
        bonus: object;
        pdd: object;
    };
}

// 2. A classe, agora corrigida para implementar a interface corretamente
export default class Race implements IRace {
    public name: string;
    public raceData: {
        bonus: object;
        pdd: object;
    };

    constructor(name: string, bonus: object, pdd: object) {
        this.name = name;
        // CORREÇÃO: O construtor agora monta o objeto 'raceData' aninhado.
        this.raceData = {
            bonus: bonus,
            pdd: pdd,
        };
    }

    /**
     * Retorna uma representação da raça segura para ser enviada ao cliente.
     * @returns Um objeto com dados da raça para o cliente.
     */
    toClientJSON(): IRace {
        // CORREÇÃO: Retorna a estrutura completa da classe, que já corresponde à interface IRace.
        return {
            name: this.name,
            raceData: this.raceData,
        };
    }

    /**
     * Retorna uma representação "achatada" (flat) da raça para persistência no banco de dados.
     * @returns Um objeto com dados da raça para persistência.
     */
    // CORREÇÃO: O tipo de retorno foi ajustado para refletir a estrutura "achatada".
    toPersistenceObject(): { name: string; bonus: object; pdd: object } {
        // CORREÇÃO: Desestrutura 'raceData' para salvar os campos separadamente no DB.
        return {
            name: this.name,
            bonus: this.raceData.bonus,
            pdd: this.raceData.pdd,
        };
    }
}