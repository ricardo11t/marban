import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper, Select, MenuItem, InputLabel, Typography, CircularProgress } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { RacesContext } from '../context/RacesProvider';
import { ClassesContext } from '../context/ClassesProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Estilos para TextFields e Selects com fundo preto e texto branco (variant="filled")
const blackFilledFieldStyles = {
  variant: "filled", sx: { '& .MuiFilledInput-root': { backgroundColor: 'black', color: 'white', border: '1px solid rgba(255, 255, 255, 0.23)', borderRadius: '4px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.5)', }, '&.Mui-focused': { backgroundColor: 'black', borderColor: 'white', }, '&.Mui-disabled': { backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(255, 255, 255, 0.1)', }, '&:before, &:after': { borderBottom: 'none !important', }, }, '& .MuiFilledInput-input': { color: 'white', padding: '12px 12px 10px', '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': { WebkitBoxShadow: '0 0 0 1000px black inset !important', WebkitTextFillColor: 'white !important', caretColor: 'white !important', borderRadius: 'inherit', }, }, '& label.MuiInputLabel-filled': { color: 'rgba(255, 255, 255, 0.7)', }, '& label.MuiInputLabel-filled.Mui-focused': { color: 'white', }, '& label.MuiInputLabel-filled.Mui-disabled': { color: 'rgba(255, 255, 255, 0.4)', }, '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)', }, }
};
const blackPaperMenuStyles = {
  PaperProps: { sx: { backgroundColor: 'black', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', '& .MuiMenuItem-root, & .MuiAutocomplete-option': { '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', }, '&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.16) !important', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.24) !important', }, }, '&[aria-selected="true"]': { backgroundColor: 'rgba(255, 255, 255, 0.16) !important', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.24) !important', }, } }, }, },
};
const autocompleteRootStyles = {
  '& .MuiOutlinedInput-root .MuiSvgIcon-root, & .MuiFilledInput-root .MuiSvgIcon-root, & .MuiInput-root .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)', }, '& .MuiAutocomplete-clearIndicator:hover, & .MuiAutocomplete-popupIndicator:hover': { '.MuiSvgIcon-root': { color: 'white', } },
};

const requisitosEstrelas = {
  fisico: {
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 0,
    segundaEstrelaMenor: 17,
    segundaEstrelaMaior: 33,
    terceiraEstrelaMenor: 50,
    terceiraEstrelaMaior: 67,
    quartaEstrelaMenor: 84,
    quartaEstrelaMaior: 100,
  },
  magico: {
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 25,
    segundaEstrelaMenor: 50,
    segundaEstrelaMaior: 75,
    terceiraEstrelaMenor: 100,
    terceiraEstrelaMaior: 125,
    quartaEstrelaMenor: 150,
    quartaEstrelaMaior: 175,
  },
  neutro: {
    semRequisitos: 'Por Enquanto'
  },
  hibrido: {
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 0,
    segundaEstrelaMenor: 17,
    segundaEstrelaMaior: 33,
    terceiraEstrelaMenor: 50,
    terceiraEstrelaMaior: 67,
    quartaEstrelaMenor: 84,
    quartaEstrelaMaior: 100,
  },
  fisicoEHibrido:{
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 0,
    segundaEstrelaMenor: 17,
    segundaEstrelaMaior: 33,
    terceiraEstrelaMenor: 50,
    terceiraEstrelaMaior: 67,
    quartaEstrelaMenor: 84,
    quartaEstrelaMaior: 100,
  },
  magicoEFisico: {
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 25*2,
    segundaEstrelaMenor: 50*2,
    segundaEstrelaMaior: 75*2,
    terceiraEstrelaMenor: 100*2,
    terceiraEstrelaMaior: 125*2,
    quartaEstrelaMenor: 150*2,
    quartaEstrelaMaior: 175*2,
  },
  neutroEHibrido: {
    primeiraEstrelaMenor: 0,
    primeiraEstrelaMaior: 0,
    segundaEstrelaMenor: 17,
    segundaEstrelaMaior: 33,
    terceiraEstrelaMenor: 50,
    terceiraEstrelaMaior: 67,
    quartaEstrelaMenor: 84,
    quartaEstrelaMaior: 100,
  }
};

const requisitosCirculo = {
  fisico: {
    primeiroCirculo: 0,
    segundoCirculo: 35,
    terceiroCirculo: 45,
    quartoCirculo: 55,
    quintoCirculo: 65,
    sextoCirculo: 85,
    setimoCirculo: 105,
    oitavoCirculo: 125,
    nonoCirculo: 145,
    decimoCirculo: 165
  },
  magico: {
    primeiroCirculo: 0,
    segundoCirculo: 35,
    terceiroCirculo: 45,
    quartoCirculo: 55,
    quintoCirculo: 65,
    sextoCirculo: 75,
    setimoCirculo: 85,
    oitavoCirculo: 95,
    nonoCirculo: 105,
    decimoCirculo: 125
  },
  neutro: {
    semRequisitos: 'Por Enquanto'
  },
  hibrido: {
    primeiroCirculo: 0,
    segundoCirculo: 35,
    terceiroCirculo: 45,
    quartoCirculo: 55,
    quintoCirculo: 65,
    sextoCirculo: 75,
    setimoCirculo: 85,
    oitavoCirculo: 95,
    nonoCirculo: 105,
    decimoCirculo: 125
  },
  fisicoEHibrido: {
    primeiroCirculo: 0,
    segundoCirculo: 35,
    terceiroCirculo: 45,
    quartoCirculo: 55,
    quintoCirculo: 65,
    sextoCirculo: 75,
    setimoCirculo: 85,
    oitavoCirculo: 95,
    nonoCirculo: 105,
    decimoCirculo: 125
  },
  magicoEFisico: {
    primeiroCirculo: 0,
    segundoCirculo: 35*2,
    terceiroCirculo: 45*2,
    quartoCirculo: 55*2,
    quintoCirculo: 65*2,
    sextoCirculo: 75*2,
    setimoCirculo: 85*2,
    oitavoCirculo: 95*2,
    nonoCirculo: 105*2,
    decimoCirculo: 125*2
  },
  neutroEHibrido: {
    primeiroCirculo: 0,
    segundoCirculo: 35,
    terceiroCirculo: 45,
    quartoCirculo: 55,
    quintoCirculo: 65,
    sextoCirculo: 75,
    setimoCirculo: 85,
    oitavoCirculo: 95,
    nonoCirculo: 105,
    decimoCirculo: 125
  }
}

const CriacaoPage = () => {
  const [isHibrido, setIsHibrido] = useState(false);
  const [isSClasse, setIsSClasse] = useState(false);
  const [statsShown, setStatsShown] = useState(false);

  const [racaPrimaria, setRacaPrimaria] = useState(null);
  const [racaSecundaria, setRacaSecundaria] = useState(null);
  const [classePrimaria, setClassePrimaria] = useState(null);
  const [classeSecundaria, setClasseSecundaria] = useState(null);

  const [classeDeArmaduraF, setClasseDeArmaduraF] = useState(1);
  const [classeDeArmaduraM, setClasseDeArmaduraM] = useState(1);

  const [PdV, setPdV] = useState(0);
  const [PdE, setPdE] = useState(0);
  const [PdAFisico, setPdAFisico] = useState(0);
  const [PdAMagico, setPdAMagico] = useState(0);
  const [PdD, setPdD] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [pontos, setPontos] = useState(50);
  const [pontosDiff, setPontosDiff] = useState(50);
  const [circulo, setCirculo] = useState(1);
  const [estrela, setEstrela] = useState('');
  const [classUpgrades, setClassUpgrades] = useState(0);
  const [slotHabilidade, setSlotHabilidade] = useState(3);

  const [CAF, setCAF] = useState(0);
  const [CAM, setCAM] = useState(0);

  const [stats, setStats] = useState({
    Vigor: 0, Habilidade: 0, Percepção: 0, Inteligência: 0, Domínio: 0, CAB: 0,
  });

  const [bonusRaca, setBonusRaca] = useState({});
  const [bonusClasse, setBonusClasse] = useState({});

  const [atributos, setAtributos] = useState({
    forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0,
    sobrevivencia: 0, agilidade: 0, destreza: 0, competencia: 0,
    criatividade: 0, sorte: 0
  });

  const { races } = useContext(RacesContext);
  const { classes } = useContext(ClassesContext);

  useEffect(() => {
    const racaPrimariaObj = racaPrimaria && Array.isArray(races) ? races.find(r => r.name === racaPrimaria) : null;
    const racaSecundariaObj = racaSecundaria && Array.isArray(races) ? races.find(r => r.name === racaSecundaria) : null;
    const classePrimariaObj = classePrimaria && Array.isArray(classes) ? classes.find(c => c.name === classePrimaria) : null;
    const classeSecundariaObj = classeSecundaria && Array.isArray(classes) ? classes.find(c => c.name === classeSecundaria) : null;

    const { Vigor, Habilidade, Percepção, Inteligência, Domínio } = stats;
    setPdV((2 * Vigor) + Habilidade);
    setPdE(Percepção + Inteligência + Domínio);


    const qtdClassUpgrades = Math.floor(nivel/5);
    setClassUpgrades(qtdClassUpgrades);

    const qtdSlotsHabilidade = Math.floor(nivel/5)+3;
    setSlotHabilidade(qtdSlotsHabilidade);

    const calcularPdDParaUmaRaca = (dadosPddRaca, atributosAtuaisPersonagem) => {
      if (!dadosPddRaca) return 0;
      const pdDFixoDaRaca = dadosPddRaca.PdDFixo || 0;
      const pdDFracaoDaRaca = dadosPddRaca.PdDFração || 0;
      const atributoUtilizadoPelaRaca = dadosPddRaca.AtributoUtilizado;
      let pddCalculadoParaEstaRaca = pdDFixoDaRaca;
      if (atributoUtilizadoPelaRaca && pdDFracaoDaRaca !== 0) {
        const valorDoAtributoNoPersonagem = atributosAtuaisPersonagem[atributoUtilizadoPelaRaca] || 0;
        pddCalculadoParaEstaRaca += Math.floor(pdDFracaoDaRaca * valorDoAtributoNoPersonagem);
      }
      return pddCalculadoParaEstaRaca;
    };

    const bonusRacaPrimaria = racaPrimariaObj?.raceData?.bonus || {};
    const bonusRacaSecundaria = racaSecundariaObj?.raceData?.bonus || {};
    const totalBonusRaca = {};
    const allRacaKeys = new Set([...Object.keys(bonusRacaPrimaria), ...Object.keys(bonusRacaSecundaria)]);

    allRacaKeys.forEach(key => {
      const b1 = bonusRacaPrimaria[key] || 0;
      const b2 = bonusRacaSecundaria[key] || 0;
      if (isHibrido && racaSecundaria) {
        totalBonusRaca[key] = Math.floor((b1 + b2) / 2);
      } else {
        totalBonusRaca[key] = b1;
      }
    });
    setBonusRaca(totalBonusRaca);

    const bonusClassePrimaria = classePrimariaObj?.bonus || {};
    const bonusClasseSecundaria = classeSecundariaObj?.bonus || {};
    const tipoClassePrimariaa = classePrimariaObj?.tipo || {};
    const tipoClasseSecundariaa = classeSecundaria?.tipo || {};
    const objetoClassePrimaria = {
      bonusClassePrimaria: bonusClassePrimaria,
      tipoClassePrimaria:  tipoClassePrimariaa.tipoClasse || null
    }
    const objetoClasseSecundaria = {
      bonusClasseSecundaria: bonusClasseSecundaria,
      tipoClasseSecundaria: tipoClasseSecundariaa.tipoClasse || null
    }
    const totalBonusClasse = {};
    const allClasseKeys = new Set([...Object.keys(objetoClassePrimaria.bonusClassePrimaria), ...Object.keys(objetoClasseSecundaria.bonusClasseSecundaria)]);

    allClasseKeys.forEach(key => {
      totalBonusClasse[key] = (bonusClassePrimaria[key] || 0) + (isSClasse && classeSecundaria ? (bonusClasseSecundaria[key] || 0) : 0);
    });
    setBonusClasse(totalBonusClasse);

    const tipoClasseAtual = classePrimariaObj?.tipo?.tipoClasse || null;
    const tipoClasseSecundariaAtual = isSClasse && classeSecundariaObj ? (classeSecundariaObj?.tipo?.tipoClasse || null) : null;

    let tipoDeRequisito;

    if (tipoClasseAtual && tipoClasseSecundariaAtual) {
      if ((tipoClasseAtual === 'fisico' && tipoClasseSecundariaAtual === 'magico')) {
        tipoDeRequisito = 'fisicoEMagico';
      } else if (tipoClasseAtual === 'magico' && tipoClasseSecundariaAtual === 'fisico') {
        tipoDeRequisito = 'magicoEFisico';
      } else if ((tipoClasseAtual === 'neutro' && tipoClasseSecundariaAtual === 'hibrido') || (tipoClasseAtual === 'hibrido' && tipoClasseSecundariaAtual === 'neutro')) {
        tipoDeRequisito = 'neutroEHibrido';
      } else if ((tipoClasseAtual === 'magico' && tipoClasseSecundariaAtual === 'hibrido') || (tipoClasseAtual === 'hibrido' && tipoClasseSecundariaAtual === 'magico')) {
        tipoDeRequisito = 'magico';
      } else if ((tipoClasseAtual === 'fisico' && tipoClasseSecundariaAtual === 'hibrido') || (tipoClasseAtual === 'hibrido' && tipoClasseSecundariaAtual === 'fisico')) {
        tipoDeRequisito = 'fisico';
      } else if ((tipoClasseAtual === 'neutro' && tipoClasseSecundariaAtual === 'fisico') || (tipoClasseAtual === 'fisico' && tipoClasseSecundariaAtual === 'neutro')) {
        tipoDeRequisito = 'fisico';
      } else if ((tipoClasseAtual === 'neutro' && tipoClasseSecundariaAtual === 'magico') || (tipoClasseAtual === 'magico' && tipoClasseSecundariaAtual === 'neutro')) {
        tipoDeRequisito = 'magico';
      } else {
        tipoDeRequisito = tipoClasseAtual;
      }
    } else if (tipoClasseAtual) {
      tipoDeRequisito = tipoClasseAtual;
    } else if (tipoClasseSecundariaAtual) {
      tipoDeRequisito = tipoClasseSecundariaAtual;
    }

    if (!tipoDeRequisito) {
      setEstrela("Primeira Estrela Menor");
    } else {
      const reqEstrela = requisitosEstrelas[tipoDeRequisito];
      let statusFinalEstrela = "Primeira Estrela Menor";

      if (!reqEstrela || reqEstrela.semRequisitos) {
        statusFinalEstrela = "Nenhuma estrela aplicável";
      } else {
        // Lógica de cálculo da estrela permanece a mesma
        if (nivel >= reqEstrela.primeiraEstrelaMenor && nivel < reqEstrela.segundaEstrelaMenor) statusFinalEstrela = "Primeira Estrela Menor";
        if (nivel >= reqEstrela.primeiraEstrelaMaior && nivel < reqEstrela.segundaEstrelaMenor) statusFinalEstrela = "Primeira Estrela Maior";
        if (nivel >= reqEstrela.segundaEstrelaMenor && nivel < reqEstrela.segundaEstrelaMaior) statusFinalEstrela = "Segunda Estrela Menor";
        if (nivel >= reqEstrela.segundaEstrelaMaior && nivel < reqEstrela.terceiraEstrelaMenor) statusFinalEstrela = "Segunda Estrela Maior";
        if (nivel >= reqEstrela.terceiraEstrelaMenor && nivel < reqEstrela.terceiraEstrelaMaior) statusFinalEstrela = "Terceira Estrela Menor";
        if (nivel >= reqEstrela.terceiraEstrelaMaior && nivel < reqEstrela.quartaEstrelaMenor) statusFinalEstrela = "Terceira Estrela Maior";
        if (nivel >= reqEstrela.quartaEstrelaMenor && nivel < reqEstrela.quartaEstrelaMaior) statusFinalEstrela = "Quarta Estrela Menor";
        if (nivel >= reqEstrela.quartaEstrelaMaior) statusFinalEstrela = "Quarta Estrela Maior";
      }
      setEstrela(statusFinalEstrela);
    }

    const PdEAtual = Percepção + Inteligência + Domínio;

    if (!tipoDeRequisito) {
      setCirculo(1);
    } else {
      const reqCirculo = requisitosCirculo[tipoDeRequisito];
      let statusFinalCirculo = 1;

      if (!reqCirculo || reqCirculo.semRequisitos) {
        statusFinalCirculo = 1;
      } else {
        if (PdEAtual >= reqCirculo.decimoCirculo) {
          // --- CORREÇÃO 3: LÓGICA DO CÍRCULO SIMPLIFICADA E CORRIGIDA ---
          const excessoPdE = PdEAtual - reqCirculo.decimoCirculo;
          const circulosAdicionais = Math.floor(excessoPdE / 20); // A cada 20 pontos, ganha um círculo
          statusFinalCirculo = 10 + circulosAdicionais;
        } else if (PdEAtual >= reqCirculo.nonoCirculo) {
          statusFinalCirculo = 9;
        } else if (PdEAtual >= reqCirculo.oitavoCirculo) {
          statusFinalCirculo = 8;
        } else if (PdEAtual >= reqCirculo.setimoCirculo) {
          statusFinalCirculo = 7;
        } else if (PdEAtual >= reqCirculo.sextoCirculo) {
          statusFinalCirculo = 6;
        } else if (PdEAtual >= reqCirculo.quintoCirculo) {
          statusFinalCirculo = 5;
        } else if (PdEAtual >= reqCirculo.quartoCirculo) {
          statusFinalCirculo = 4;
        } else if (PdEAtual >= reqCirculo.terceiroCirculo) {
          statusFinalCirculo = 3;
        } else if (PdEAtual >= reqCirculo.segundoCirculo) {
          statusFinalCirculo = 2;
        } else {
          statusFinalCirculo = 1;
        }
      }
      setCirculo(statusFinalCirculo);
    }

    const atributosCalculados = {
      forca: Vigor + Habilidade + (totalBonusRaca.forca || 0) + (totalBonusClasse.forca || 0),
      resFisica: Vigor + Percepção + (totalBonusRaca.resFisica || 0) + (totalBonusClasse.resFisica || 0),
      resMental: Inteligência + Domínio + (totalBonusRaca.resMental || 0) + (totalBonusClasse.resMental || 0),
      manipulacao: Inteligência + Domínio + (totalBonusRaca.manipulacao || 0) + (totalBonusClasse.manipulacao || 0),
      resMagica: Vigor + Inteligência + (totalBonusRaca.resMagica || 0) + (totalBonusClasse.resMagica || 0),
      sobrevivencia: Vigor + Domínio + (totalBonusRaca.sobrevivencia || 0) + (totalBonusClasse.sobrevivencia || 0),
      agilidade: Habilidade + Percepção + (totalBonusRaca.agilidade || 0) + (totalBonusClasse.agilidade || 0),
      destreza: Habilidade + Domínio + (totalBonusRaca.destreza || 0) + (totalBonusClasse.destreza || 0),
      competencia: Habilidade + Inteligência + (totalBonusRaca.competencia || 0) + (totalBonusClasse.competencia || 0),
      criatividade: Inteligência + Percepção + (totalBonusRaca.criatividade || 0) + (totalBonusClasse.criatividade || 0),
      sorte: Percepção + Domínio + (totalBonusRaca.sorte || 0) + (totalBonusClasse.sorte || 0),
    };
    setAtributos(atributosCalculados);

    const dadosPddRacaPrimaria = racaPrimariaObj?.raceData?.pdd;
    const pddCalculadoRacaPrimaria = calcularPdDParaUmaRaca(dadosPddRacaPrimaria, atributosCalculados);
    let pddFinalPersonagem = 0;

    if (isHibrido && racaSecundariaObj) {
      const dadosPddRacaSecundaria = racaSecundariaObj?.raceData?.pdd;
      const pddCalculadoRacaSecundaria = calcularPdDParaUmaRaca(dadosPddRacaSecundaria, atributosCalculados);
      pddFinalPersonagem = Math.floor((pddCalculadoRacaPrimaria + pddCalculadoRacaSecundaria) / 2);
    } else {
      pddFinalPersonagem = pddCalculadoRacaPrimaria;
    }
    setPdD(pddFinalPersonagem);

  }, [
    nivel,
    stats,
    racaPrimaria,
    racaSecundaria,
    classePrimaria,
    classeSecundaria,
    isHibrido,
    isSClasse,
    races,
    classes,
    PdE
  ]);

  useEffect(() => {
    const numPdAFisico = Number(PdAFisico) || 0;
    const numPdAMagico = Number(PdAMagico) || 0;
    const numStatsCAB = Number(stats.CAB) || 0;
    const agilidadeNum = Number(atributos.agilidade) || 0;
    const resFisicaNum = Number(atributos.resFisica) || 0;
    const resMagicaNum = Number(atributos.resMagica) || 0;
    let cafCalculado = 0;
    let camCalculado = 0;
    if (numPdAFisico >= numPdAMagico) {
      cafCalculado = 20 + (((2 / 5) * numPdAFisico) + (classeDeArmaduraF * ((1 / 5) * (agilidadeNum + resFisicaNum)))) + numStatsCAB;
      camCalculado = 20 + (((2 / 5) * (numPdAFisico + numPdAMagico)) + (classeDeArmaduraF * ((1 / 5) * (agilidadeNum + resMagicaNum)))) + numStatsCAB;
    } else {
      cafCalculado = 20 + (((2 / 5) * numPdAFisico) + (classeDeArmaduraM * ((1 / 5) * (agilidadeNum + resFisicaNum)))) + numStatsCAB;
      camCalculado = 20 + (((2 / 5) * (numPdAFisico + numPdAMagico)) + (classeDeArmaduraM * ((1 / 5) * (agilidadeNum + resMagicaNum)))) + numStatsCAB;
    }
    setCAF(Math.floor(cafCalculado));
    setCAM(Math.floor(camCalculado));
  }, [PdAFisico, PdAMagico, classeDeArmaduraF, classeDeArmaduraM, atributos, stats.CAB]);

  const calcularCustoStat = (valorStat) => {
    if (valorStat <= 0) return 0;
    let custoTotalParaOStat = 0;

    for (let i = 1; i <= valorStat; i++) {
      let custoDoPontoEspecifico_i = 1;
      if (i > 15) {
        custoDoPontoEspecifico_i = 1 + 1 + Math.floor((i - 16) / 3);
      }
      custoTotalParaOStat += custoDoPontoEspecifico_i;
    }
    return custoTotalParaOStat;
  };

  const handleStatChange = (event) => {
    const { name, value } = event.target;
    const valorInput = value === '' ? 0 : parseInt(value, 10);
    const novoValorStat = isNaN(valorInput) ? 0 : Math.max(0, valorInput);

    const statsAtualizadosParaCalculo = {
      ...stats,
      [name]: novoValorStat,
    };

    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];

    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(statsAtualizadosParaCalculo[statKey]);
    });

    setPontosDiff(pontos - somaDosCustosReais);
    setStats(statsAtualizadosParaCalculo);
  };

  const handleNivelChange = (event) => {
    const valorNivelInput = event.target.value === '' ? 0 : parseInt(event.target.value, 10);
    const novoNivel = isNaN(valorNivelInput) ? 0 : Math.max(0, valorNivelInput);
    const novosPontosDisponiveis = 50 + (novoNivel * 5);

    setNivel(novoNivel);
    setPontos(novosPontosDisponiveis);

    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];
    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(stats[statKey]);
    });
    setPontosDiff(novosPontosDisponiveis - somaDosCustosReais);
  };

  const refreshPontosRestantes = () => {
    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];
    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(stats[statKey]);
    });
    setPontosDiff(pontos - somaDosCustosReais);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    refreshPontosRestantes();
    setStatsShown(true);
  };

  const handleCheckboxChangeHib = (event) => {
    setIsHibrido(event.target.checked);
    if (!event.target.checked) setRacaSecundaria(null);
  };

  const handleCheckboxChangeClass = (event) => {
    setIsSClasse(event.target.checked);
    if (!event.target.checked) setClasseSecundaria(null);
  };

  const handleChangeF = (event) => {
    setClasseDeArmaduraF(Number(event.target.value));
  };

  const handleChangeM = (event) => {
    setClasseDeArmaduraM(Number(event.target.value));
  };

  const handlePdAFisicoChange = (event) => {
    const value = event.target.value === '' ? 0 : parseInt(event.target.value, 10);
    setPdAFisico(isNaN(value) ? 0 : Math.max(0, value));
  }

  const handlePdAMagicoChange = (event) => {
    const value = event.target.value === '' ? 0 : parseInt(event.target.value, 10);
    setPdAMagico(isNaN(value) ? 0 : Math.max(0, value));
  }

  const nomesRacas = Array.isArray(races) ? races.map(r => r.name) : [];
  const nomesClasses = Array.isArray(classes) ? classes.map(c => c.name) : [];
  const statusList = ['Vigor', 'Habilidade', 'Percepção', 'Inteligência', 'Domínio', 'CAB'];

  const tableRows = Object.keys(atributos).map((key) => {
    const atributoBaseCalculado = (atributos[key] || 0) - (bonusRaca[key] || 0) - (bonusClasse[key] || 0);
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      base: atributoBaseCalculado,
      racaBonus: bonusRaca[key] || 0,
      classeBonus: bonusClasse[key] || 0,
      total: atributos[key] || 0
    }
  });

  return (
    <>
      <Header />
      <main className='bg-gray-900 px-2 sm:px-4'>
        <div className='justify-center text-center text-4xl text-white font-bold pt-5 mb-5'> {/* Texto do H1 branco */}
          <Typography variant='h3' component="h1" className='font-bold text-center mb-10'>Criação de Personagens</Typography>
        </div>
        <div className='flex flex-col items-center min-h-screen'>
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            className='bg-[#601b1c] text-white mb-6 w-full'
            sx={{
              height: 'fit-content',
              maxWidth: '900px',
              borderRadius: '10px',
              padding: { xs: '16px', sm: '20px', md: '24px' }
            }}
          >
            <div className='flex justify-center items-center mb-6'>
              <div className='text-center'>
                <h4 className='text-3xl mb-2'>Qual o nível do personagem?</h4>
                <div className='flex justify-center items-center gap-4'>
                  <div>
                    <InputLabel sx={{ color: 'white', mb: 0.5 }}>Nível</InputLabel>
                    <TextField
                      name='nivel'
                      type='number'
                      variant={blackFilledFieldStyles.variant}
                      value={nivel === 0 ? '' : nivel}
                      onChange={handleNivelChange}
                      onFocus={(e) => e.target.select()}
                      sx={{ ...blackFilledFieldStyles.sx, width: '100px' }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                      autoComplete='off'
                    />
                  </div>
                  <h5 className='text-3xl'>Pontos Totais: {pontos}</h5>
                </div>
              </div>
            </div>

            <div className='flex justify-evenly mb-6'>
              <FormControlLabel
                control={<Checkbox checked={isHibrido} onChange={handleCheckboxChangeHib} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
                label="É híbrido?"
                sx={{ color: 'white' }}
              />
              <FormControlLabel
                control={<Checkbox checked={isSClasse} onChange={handleCheckboxChangeClass} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
                label="Tem segunda classe?"
                sx={{ color: 'white' }}
              />
            </div>
            <div>
              <div className='flex flex-col md:flex-row justify-evenly gap-4'>
                <Autocomplete
                  value={racaPrimaria}
                  onChange={(event, newValue) => setRacaPrimaria(newValue)}
                  options={nomesRacas}
                  getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                  PaperComponent={(props) => <Paper {...props} {...blackPaperMenuStyles.PaperProps} />}
                  sx={{ ...autocompleteRootStyles, width: '100%' }}
                  renderInput={(params) =>
                    <TextField
                      {...params}
                      label="Raça Primária"
                      variant={blackFilledFieldStyles.variant}
                      sx={blackFilledFieldStyles.sx}
                    />}
                />
                {isHibrido && (
                  <Autocomplete
                    value={racaSecundaria}
                    onChange={(event, newValue) => setRacaSecundaria(newValue)}
                    options={nomesRacas.filter(r => r !== racaPrimaria)}
                    getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                    PaperComponent={(props) => <Paper {...props} {...blackPaperMenuStyles.PaperProps} />}
                    sx={{ ...autocompleteRootStyles, width: '100%' }}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="Raça Secundária"
                        variant={blackFilledFieldStyles.variant}
                        sx={blackFilledFieldStyles.sx}
                      />}
                  />
                )}
              </div>
              <div className='flex flex-col md:flex-row justify-evenly gap-4 mt-5 mb-5'>
                <Autocomplete
                  value={classePrimaria}
                  onChange={(event, newValue) => setClassePrimaria(newValue)}
                  options={nomesClasses}
                  getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                  PaperComponent={(props) => <Paper {...props} {...blackPaperMenuStyles.PaperProps} />}
                  sx={{ ...autocompleteRootStyles, width: '100%', flexGrow: 1 }}
                  renderInput={(params) =>
                    <TextField
                      {...params}
                      label="Classe Primária"
                      variant={blackFilledFieldStyles.variant}
                      sx={blackFilledFieldStyles.sx}
                    />}
                />
                {isSClasse && (
                  <Autocomplete
                    value={classeSecundaria}
                    onChange={(event, newValue) => setClasseSecundaria(newValue)}
                    options={nomesClasses.filter(c => c !== classePrimaria)}
                    getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                    PaperComponent={(props) => <Paper {...props} {...blackPaperMenuStyles.PaperProps} />}
                    sx={{ ...autocompleteRootStyles, width: '100%', flexGrow: 1 }}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="Classe Secundária"
                        variant={blackFilledFieldStyles.variant}
                        sx={blackFilledFieldStyles.sx}
                      />}
                  />
                )}
              </div>
            </div>

            <section className='mt-10'>
              <div className='flex justify-center mb-2'>
                <h2 className='text-2xl'>Definição dos Status Base:</h2>
              </div>
              <div className='flex justify-center items-center gap-5 mb-5'>
                <h2 className='text-3xl'>Pontos Restantes: <span style={{ color: pontosDiff < 0 ? 'yellow' : 'white', fontWeight: 'bold' }}>{pontosDiff}</span></h2>
              </div>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                {statusList.map((stat) => (
                  <div key={stat} className='flex-wrap'> {/* Adicionada key aqui */}
                    <InputLabel sx={{ color: 'white', mb: 0.5 }}>{stat}</InputLabel> {/* Label dos status branco */}
                    <TextField
                      name={stat}
                      type="number"
                      variant={blackFilledFieldStyles.variant}
                      value={stats[stat] === 0 && stat !== 'CAB' ? '' : stats[stat]}
                      onChange={handleStatChange}
                      onFocus={(e) => e.target.select()}
                      InputLabelProps={{ shrink: true }}
                      sx={{ ...blackFilledFieldStyles.sx, maxWidth: '150px', width: '100%' }}
                      inputProps={{ min: "0" }}
                    />
                  </div>
                ))}
              </Box>
              <Box>
                <div className='flex flex-col md:flex-row justify-center gap-5 mt-4'>
                  <div>
                    <InputLabel id="classe-armadura-fisica-label" sx={{ color: 'white', mb: 0.5 }}>Classe de Armadura Física</InputLabel>
                    <Select
                      labelId="classe-armadura-fisica-label"
                      value={classeDeArmaduraF}
                      variant={blackFilledFieldStyles.variant} // Aplicando variant
                      onChange={handleChangeF}
                      sx={{ ...blackFilledFieldStyles.sx, width: '100%', md: { minWidth: '300px' } }}
                      MenuProps={blackPaperMenuStyles} // Estilos para o menu dropdown
                    >
                      <MenuItem value={1}>Sem Armaduras</MenuItem>
                      <MenuItem value={0.75}>Armaduras Leves</MenuItem>
                      <MenuItem value={0.5}>Armaduras Médias</MenuItem>
                      <MenuItem value={0.25}>Armaduras Pesadas</MenuItem>
                      <MenuItem value={0}>Armaduras Extra-Pesadas</MenuItem>
                    </Select>
                  </div>
                  <div className='w-full md:w-auto'>
                    <InputLabel id="classe-armadura-magica-label" sx={{ color: 'white', mb: 0.5 }}>Classe de Armadura Mágica</InputLabel>
                    <Select
                      labelId="classe-armadura-magica-label"
                      value={classeDeArmaduraM}
                      variant={blackFilledFieldStyles.variant}
                      onChange={handleChangeM}
                      sx={{ ...blackFilledFieldStyles.sx, width: '100%', md: { minWidth: '300px' } }}
                      MenuProps={blackPaperMenuStyles}
                    >
                      <MenuItem value={1}>Sem Armaduras</MenuItem>
                      <MenuItem value={0.75}>Armaduras Leves</MenuItem>
                      <MenuItem value={0.5}>Armaduras Médias</MenuItem>
                      <MenuItem value={0.25}>Armaduras Pesadas</MenuItem>
                      <MenuItem value={0}>Armaduras Extra-Pesadas</MenuItem>
                    </Select>
                  </div>
                </div>
                <div className='flex flex-col md:flex-row justify-center mt-5 gap-5'>
                  <div className='w-full md:w-auto'>
                    <InputLabel sx={{ color: 'white', mb: 0.5 }}>PdA Físico (Base)</InputLabel>
                    <TextField
                      value={PdAFisico === 0 ? '' : PdAFisico}
                      variant={blackFilledFieldStyles.variant}
                      sx={{ ...blackFilledFieldStyles.sx, width: '100%', md: { minWidth: '300px' } }}
                      type="number"
                      onChange={handlePdAFisicoChange}
                      onFocus={(e) => e.target.select()}
                      inputProps={{ min: "0" }}
                    />
                  </div>
                  <div className='w-full md:w-auto'>
                    <InputLabel sx={{ color: 'white', mb: 0.5 }}>PdA Mágico (Base)</InputLabel>
                    <TextField
                      value={PdAMagico === 0 ? '' : PdAMagico}
                      variant={blackFilledFieldStyles.variant}
                      sx={{ ...blackFilledFieldStyles.sx, width: '100%', md: { minWidth: '300px' } }}
                      type="number"
                      onChange={handlePdAMagicoChange}
                      onFocus={(e) => e.target.select()}
                      inputProps={{ min: "0" }}
                    />
                  </div>
                </div>
              </Box>
            </section>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ padding: '10px 30px', fontSize: '1.1rem', backgroundColor: '#b91c1c', '&:hover': { backgroundColor: '#991b1b' } }}
              >
                Calcular Atributos e Mostrar Ficha
              </Button>
            </Box>
          </Box>

          {statsShown && (
            <Box
              sx={{
                width: '100%',
                maxWidth: '1200px', // Limita em telas grandes
                borderRadius: '10px',
                padding: { xs: '10px', sm: '20px' }, // Padding responsivo
                marginTop: '20px',
                backgroundColor: '#601b1c',
                marginBottom: 5
              }}
            >
              <Box className={"mb-5"}>
                <TableContainer sx={{ backgroundColor: 'black' }} component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>PdV</TableCell>
                        <TableCell sx={{ color: 'blue', fontWeight: 'bold' }}>PdE</TableCell>
                        <TableCell sx={{ color: 'crimson', fontWeight: 'bold' }}>PdA Físico (Base)</TableCell>
                        <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>PdA Mágico (Base)</TableCell>
                        <TableCell sx={{ color: 'chocolate', fontWeight: 'bold' }}>PdD</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>{PdV}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{PdE}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{PdAFisico}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{PdAMagico}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{PdD}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box className={"mb-5"}>
                <TableContainer sx={{ backgroundColor: 'black' }} component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'crimson', fontWeight: 'bold' }}>CAF</TableCell>
                        <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>CAM</TableCell>
                        <TableCell sx={{ color: 'bisque', fontWeight: 'bold' }}>CAB</TableCell>
                        <TableCell sx={{ color: 'bisque', fontWeight: 'bold' }}>Estrela</TableCell>
                        <TableCell sx={{ color: 'bisque', fontWeight: 'bold' }}>Circulo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'white' }}>{CAF}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{CAM}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{stats.CAB}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{estrela}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{circulo}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box className={"mb-5"}>
                <TableContainer sx={{ backgroundColor: 'black' }} component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'crimson', fontWeight: 'bold' }}>Peso Em Combate</TableCell>
                        <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>Peso F. Combate (Força)</TableCell>
                        <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>Class Upgrades</TableCell>
                        <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>Slots de Habilidade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'white' }}>{stats.Vigor}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{atributos.forca}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{classUpgrades}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{slotHabilidade}</TableCell>             
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <TableContainer sx={{ backgroundColor: 'black' }} component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'black' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Atributo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Base (Status)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Bônus Raça</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Bônus Classe</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow key={row.name} sx={{ backgroundColor: 'black' }}>
                        <TableCell sx={{ color: 'white' }} component="th" scope="row">{row.name}</TableCell>
                        <TableCell sx={{ color: 'white' }} align="center">{row.base}</TableCell>
                        <TableCell align="center" sx={{ color: row.racaBonus > 0 ? 'lightgreen' : row.racaBonus < 0 ? 'lightcoral' : 'white' }}>
                          {row.racaBonus > 0 ? `+${row.racaBonus}` : row.racaBonus}
                        </TableCell>
                        <TableCell align="center" sx={{ color: row.classeBonus > 0 ? 'lightgreen' : row.classeBonus < 0 ? 'lightcoral' : 'white' }}>
                          {row.classeBonus > 0 ? `+${row.classeBonus}` : row.classeBonus}
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CriacaoPage;