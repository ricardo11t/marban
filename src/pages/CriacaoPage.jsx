import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper, Select, MenuItem, InputLabel } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import { RacesContext } from '../context/RacesProvider';
import { ClassesContext } from '../context/ClassesProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
  const [pontos, setPontos] = useState(50); // Inicializa com pontos para nível 0
  const [pontosDiff, setPontosDiff] = useState(50); // Inicializa com pontos para nível 0

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

  // Primeiro useEffect: Calcula bônus, atributos, PdV, PdE e PdD
  useEffect(() => {
    const calcularPdDParaUmaRaca = (dadosPddRaca, atributosAtuaisPersonagem) => {
      if (!dadosPddRaca) {
        return 0;
      }
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

    const bonusRacaPrimaria = racaPrimaria && races && races[racaPrimaria] ? races[racaPrimaria].bonus : {};
    const bonusRacaSecundaria = racaSecundaria && races && races[racaSecundaria] ? races[racaSecundaria].bonus : {};
    const totalBonusRaca = {};
    const racaPrimariaKeys = Object.keys(bonusRacaPrimaria);
    const racaSecundariaKeys = Object.keys(bonusRacaSecundaria);
    const allRacaKeys = new Set([...racaPrimariaKeys, ...racaSecundariaKeys]);

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

    const bonusClassePrimaria = classePrimaria && classes && classes[classePrimaria] ? classes[classePrimaria].bonus : {};
    const bonusClasseSecundaria = classeSecundaria && classes && classes[classeSecundaria] ? classes[classeSecundaria].bonus : {};
    const totalBonusClasse = {};
    const classePrimariaKeys = Object.keys(bonusClassePrimaria);
    const classeSecundariaKeys = Object.keys(bonusClasseSecundaria);
    const allClasseKeys = new Set([...classePrimariaKeys, ...classeSecundariaKeys]);

    allClasseKeys.forEach(key => {
      totalBonusClasse[key] = (bonusClassePrimaria[key] || 0) + (isSClasse && classeSecundaria ? (bonusClasseSecundaria[key] || 0) : 0);
    });
    setBonusClasse(totalBonusClasse);

    const Vigor = Number(stats.Vigor) || 0;
    const Habilidade = Number(stats.Habilidade) || 0;
    const Percepcao = Number(stats.Percepção) || 0;
    const Inteligencia = Number(stats.Inteligência) || 0;
    const Dominio = Number(stats.Domínio) || 0;

    setPdV((2 * Vigor) + Habilidade);
    setPdE(Percepcao + Inteligencia + Dominio);

    const atributosCalculados = {
      forca: Vigor + Habilidade + (totalBonusRaca.forca || 0) + (totalBonusClasse.forca || 0),
      resFisica: Vigor + Percepcao + (totalBonusRaca.resFisica || 0) + (totalBonusClasse.resFisica || 0),
      resMental: Inteligencia + Dominio + (totalBonusRaca.resMental || 0) + (totalBonusClasse.resMental || 0),
      manipulacao: Inteligencia + Dominio + (totalBonusRaca.manipulacao || 0) + (totalBonusClasse.manipulacao || 0),
      resMagica: Vigor + Inteligencia + (totalBonusRaca.resMagica || 0) + (totalBonusClasse.resMagica || 0),
      sobrevivencia: Vigor + Dominio + (totalBonusRaca.sobrevivencia || 0) + (totalBonusClasse.sobrevivencia || 0),
      agilidade: Habilidade + Percepcao + (totalBonusRaca.agilidade || 0) + (totalBonusClasse.agilidade || 0),
      destreza: Habilidade + Dominio + (totalBonusRaca.destreza || 0) + (totalBonusClasse.destreza || 0),
      competencia: Habilidade + Inteligencia + (totalBonusRaca.competencia || 0) + (totalBonusClasse.competencia || 0),
      criatividade: Inteligencia + Percepcao + (totalBonusRaca.criatividade || 0) + (totalBonusClasse.criatividade || 0),
      sorte: Percepcao + Dominio + (totalBonusRaca.sorte || 0) + (totalBonusClasse.sorte || 0),
    };
    setAtributos(atributosCalculados);

    const defaultPddDataRaca = { PdDFixo: 0, PdDFração: 0, AtributoUtilizado: null };
    let pddFinalPersonagem = 0;
    const dadosPddRacaPrimaria = (racaPrimaria && races && races[racaPrimaria]?.pdd)
      ? races[racaPrimaria].pdd
      : defaultPddDataRaca;
    const pddCalculadoRacaPrimaria = calcularPdDParaUmaRaca(dadosPddRacaPrimaria, atributosCalculados);

    if (isHibrido && racaSecundaria && races && races[racaSecundaria]?.pdd) {
      const dadosPddRacaSecundaria = races[racaSecundaria].pdd;
      const pddCalculadoRacaSecundaria = calcularPdDParaUmaRaca(dadosPddRacaSecundaria, atributosCalculados);
      pddFinalPersonagem = Math.floor((pddCalculadoRacaPrimaria + pddCalculadoRacaSecundaria) / 2);
    } else {
      pddFinalPersonagem = pddCalculadoRacaPrimaria;
    }
    setPdD(pddFinalPersonagem);

  }, [stats, racaPrimaria, racaSecundaria, classePrimaria, classeSecundaria, isHibrido, isSClasse, races, classes]);

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

  // CORRIGIDO AQUI: Função para calcular o custo de um único atributo
  const calcularCustoStat = (valorStat) => {
    if (valorStat <= 0) return 0;
    let custoTotalParaOStat = 0;

    for (let i = 1; i <= valorStat; i++) {
      let custoDoPontoEspecifico_i = 1; // Custo base para pontos <= 15
      if (i > 15) {
        // Custo aumenta para 2 no 16º ponto.
        // Aumenta em +1 a cada bloco de 3 pontos a partir do 16º.
        // Bloco 0 (pontos 16,17,18): custo 1+1+0 = 2
        // Bloco 1 (pontos 19,20,21): custo 1+1+1 = 3
        // Bloco 2 (pontos 22,23,24): custo 1+1+2 = 4
        custoDoPontoEspecifico_i = 1 + 1 + Math.floor((i - 16) / 3);
      }
      custoTotalParaOStat += custoDoPontoEspecifico_i;
    }
    return custoTotalParaOStat;
  };

  const handleStatChange = (event) => {
    const { name, value } = event.target;
    const valorInput = value === '' ? 0 : parseInt(value, 10);
    const novoValorStat = isNaN(valorInput) ? 0 : Math.max(0, valorInput); // Garante que não seja negativo

    const statsAtualizadosParaCalculo = {
      ...stats,
      [name]: novoValorStat,
    };

    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];

    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(statsAtualizadosParaCalculo[statKey]);
    });
    somaDosCustosReais += (statsAtualizadosParaCalculo.CAB || 0);

    setPontosDiff(pontos - somaDosCustosReais);
    setStats(statsAtualizadosParaCalculo);
  };

  const handleNivelChange = (event) => {
    const valorNivelInput = event.target.value === '' ? 0 : parseInt(event.target.value, 10);
    const novoNivel = isNaN(valorNivelInput) ? 0 : Math.max(0, valorNivelInput); // Garante que não seja negativo
    const novosPontosDisponiveis = 50 + (novoNivel * 5);

    setNivel(novoNivel);
    setPontos(novosPontosDisponiveis);

    // Recalcula pontosDiff com os novos pontos totais e os custos atuais
    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];
    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(stats[statKey]);
    });
    somaDosCustosReais += (stats.CAB || 0);
    setPontosDiff(novosPontosDisponiveis - somaDosCustosReais);
  };

  const refreshPontosRestantes = () => {
    let somaDosCustosReais = 0;
    const atributosPrincipaisParaCusto = ['Vigor', 'Habilidade', 'Percepção', 'Domínio', 'Inteligência'];
    atributosPrincipaisParaCusto.forEach(statKey => {
      somaDosCustosReais += calcularCustoStat(stats[statKey]);
    });
    somaDosCustosReais += (stats.CAB || 0);
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

  const nomesRacas = races ? Object.keys(races) : [];
  const nomesClasses = classes ? Object.keys(classes) : [];
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
      <div className='justify-center text-center text-4xl font-bold mt-5 mb-5'>
        <h1>Criação de Personagens</h1>
      </div>
      <div className='flex flex-col items-center min-h-screen'>
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          className='bg-red-600 text-white mb-6'
          sx={{ height: 'fit-content', width: '1200px', borderRadius: '10px', padding: '20px' }}
        >
          <div className='flex justify-center items-center mb-6'>
            <div className='text-center'>
              <h4 className='text-3xl mb-2'>Qual o nível do personagem?</h4>
              <div className='flex justify-center items-center gap-4'>
                <TextField
                  name='nivel'
                  label={'Nível'}
                  type='number'
                  value={nivel === 0 ? '' : nivel}
                  onChange={handleNivelChange}
                  onFocus={(e) => e.target.select()}
                  sx={{ backgroundColor: 'white', borderRadius: 1, width: '100px' }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 0 }}
                />
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
            <div className='flex justify-evenly gap-4'>
              <Autocomplete
                value={racaPrimaria}
                onChange={(event, newValue) => setRacaPrimaria(newValue)}
                options={nomesRacas}
                getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                sx={{ width: isHibrido ? 'calc(50% - 8px)' : 'auto', minWidth: 300, flexGrow: 1, backgroundColor: 'white', borderRadius: 1 }}
                renderInput={(params) => <TextField {...params} label="Raça Primária" />}
              />
              {isHibrido && (
                <Autocomplete
                  value={racaSecundaria}
                  onChange={(event, newValue) => setRacaSecundaria(newValue)}
                  options={nomesRacas.filter(r => r !== racaPrimaria)}
                  getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                  sx={{ width: 'calc(50% - 8px)', minWidth: 300, flexGrow: 1, backgroundColor: 'white', borderRadius: 1 }}
                  renderInput={(params) => <TextField {...params} label="Raça Secundária" />}
                />
              )}
            </div>
            <div className='flex justify-evenly gap-4 mt-5 mb-5'>
              <Autocomplete
                value={classePrimaria}
                onChange={(event, newValue) => setClassePrimaria(newValue)}
                options={nomesClasses}
                getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                sx={{ width: isSClasse ? 'calc(50% - 8px)' : 'auto', minWidth: 300, flexGrow: 1, backgroundColor: 'white', borderRadius: 1 }}
                renderInput={(params) => <TextField {...params} label="Classe Primária" />}
              />
              {isSClasse && (
                <Autocomplete
                  value={classeSecundaria}
                  onChange={(event, newValue) => setClasseSecundaria(newValue)}
                  options={nomesClasses.filter(c => c !== classePrimaria)}
                  getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                  sx={{ width: 'calc(50% - 8px)', minWidth: 300, flexGrow: 1, backgroundColor: 'white', borderRadius: 1 }}
                  renderInput={(params) => <TextField {...params} label="Classe Secundária" />}
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
              <Button
                onClick={refreshPontosRestantes}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0069c0', '&:hover': { backgroundColor: '#005cb2' } }}
              >
                Atualizar Pontos
              </Button>
            </div>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
              {statusList.map((stat) => (
                <TextField
                  key={stat}
                  label={stat}
                  name={stat}
                  type="number"
                  value={stats[stat] === 0 && stat !== 'CAB' ? '' : stats[stat]}
                  onChange={handleStatChange}
                  onFocus={(e) => e.target.select()}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '150px', backgroundColor: 'white', borderRadius: 1 }}
                  inputProps={{ min: "0" }}
                />
              ))}
            </Box>
            <Box>
              <div className='flex justify-center gap-5 mt-4'>
                <div>
                  <InputLabel id="classe-armadura-fisica-label" sx={{ color: 'white', mb: 0.5 }}>Classe de Armadura Física</InputLabel>
                  <Select
                    labelId="classe-armadura-fisica-label"
                    value={classeDeArmaduraF}
                    onChange={handleChangeF}
                    sx={{ width: '300px', backgroundColor: 'white', borderRadius: 1 }}
                  >
                    <MenuItem value={1}>Sem Armaduras</MenuItem>
                    <MenuItem value={0.75}>Armaduras Leves</MenuItem>
                    <MenuItem value={0.5}>Armaduras Médias</MenuItem>
                    <MenuItem value={0.25}>Armaduras Pesadas</MenuItem>
                    <MenuItem value={0}>Armaduras Extra-Pesadas</MenuItem>
                  </Select>
                </div>
                <div>
                  <InputLabel id="classe-armadura-magica-label" sx={{ color: 'white', mb: 0.5 }}>Classe de Armadura Mágica</InputLabel>
                  <Select
                    labelId="classe-armadura-magica-label"
                    value={classeDeArmaduraM}
                    onChange={handleChangeM}
                    sx={{ width: '300px', backgroundColor: 'white', borderRadius: 1 }}
                  >
                    <MenuItem value={1}>Sem Armaduras</MenuItem>
                    <MenuItem value={0.75}>Armaduras Leves</MenuItem>
                    <MenuItem value={0.5}>Armaduras Médias</MenuItem>
                    <MenuItem value={0.25}>Armaduras Pesadas</MenuItem>
                    <MenuItem value={0}>Armaduras Extra-Pesadas</MenuItem>
                  </Select>
                </div>
              </div>
              <div className='flex justify-center mt-5 gap-5'>
                <div>
                  <InputLabel sx={{ color: 'white', mb: 0.5 }}>PdA Físico (Base)</InputLabel>
                  <TextField
                    value={PdAFisico === 0 ? '' : PdAFisico}
                    sx={{ backgroundColor: 'white', width: '300px', borderRadius: 1 }}
                    type="number"
                    onChange={handlePdAFisicoChange}
                    onFocus={(e) => e.target.select()}
                    inputProps={{ min: "0" }}
                  />
                </div>
                <div>
                  <InputLabel sx={{ color: 'white', mb: 0.5 }}>PdA Mágico (Base)</InputLabel>
                  <TextField
                    value={PdAMagico === 0 ? '' : PdAMagico}
                    sx={{ backgroundColor: 'white', width: '300px', borderRadius: 1 }}
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
            sx={{ width: '1200px', borderRadius: '10px', padding: '20px', marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <Box className={"mb-5"}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#cfcfcf' }}>
                      <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>PdV</TableCell>
                      <TableCell sx={{ color: 'blue', fontWeight: 'bold' }}>PdE</TableCell>
                      <TableCell sx={{ color: 'crimson', fontWeight: 'bold' }}>PdA Físico (Base)</TableCell>
                      <TableCell sx={{ color: 'royalblue', fontWeight: 'bold' }}>PdA Mágico (Base)</TableCell>
                      <TableCell sx={{ color: 'chocolate', fontWeight: 'bold' }}>PdD</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{PdV}</TableCell>
                      <TableCell>{PdE}</TableCell>
                      <TableCell>{PdAFisico}</TableCell>
                      <TableCell>{PdAMagico}</TableCell>
                      <TableCell>{PdD}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box className={"mb-5"}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#cfcfcf' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>CAF</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CAM</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CAB (Base)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{CAF}</TableCell>
                      <TableCell>{CAM}</TableCell>
                      <TableCell>{stats.CAB}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#cfcfcf' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Atributo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Base (Status)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Bônus Raça</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Bônus Classe</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell component="th" scope="row">{row.name}</TableCell>
                      <TableCell align="center">{row.base}</TableCell>
                      <TableCell align="center" sx={{ color: row.racaBonus > 0 ? 'green' : row.racaBonus < 0 ? 'red' : 'inherit' }}>
                        {row.racaBonus > 0 ? `+${row.racaBonus}` : row.racaBonus}
                      </TableCell>
                      <TableCell align="center" sx={{ color: row.classeBonus > 0 ? 'green' : row.classeBonus < 0 ? 'red' : 'inherit' }}>
                        {row.classeBonus > 0 ? `+${row.classeBonus}` : row.classeBonus}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CriacaoPage;