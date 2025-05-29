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
  const [PdAFisico, setPdAFisico] = useState(0); // Inicializado como número
  const [PdAMagico, setPdAMagico] = useState(0); // Inicializado como número
  const [PdD, setPdD] = useState(0); // Assumindo que PdD também é um estado, não vi handler para ele

  const [CAF, setCAF] = useState(0);
  const [CAM, setCAM] = useState(0);

  const [stats, setStats] = useState({
    Vigor: 0, Habilidade: 0, Percepção: 0, Inteligência: 0, Domínio: 0, CAB: 0, // Inicializados como números
  });

  const [bonusRaca, setBonusRaca] = useState({});
  const [bonusClasse, setBonusClasse] = useState({});
  const [atributos, setAtributos] = useState({ // Estado inicial para atributos para evitar undefined
    forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0,
    sobrevivencia: 0, agilidade: 0, destreza: 0, competencia: 0,
    criatividade: 0, sorte: 0,
  });

  const { races } = useContext(RacesContext);
  const { classes } = useContext(ClassesContext);

  // Primeiro useEffect: Calcula bônus, atributos, PdV, PdE
  useEffect(() => {
    // 1. CALCULAR BÔNUS DE RAÇA
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

    // 2. CALCULAR BÔNUS DE CLASSE
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

    // Garantir que stats sejam numéricos para cálculos
    const Vigor = Number(stats.Vigor) || 0;
    const Habilidade = Number(stats.Habilidade) || 0;
    const Percepcao = Number(stats.Percepção) || 0;
    const Inteligencia = Number(stats.Inteligência) || 0;
    const Dominio = Number(stats.Domínio) || 0;
    // CAB é usado no outro useEffect

    // 3. CALCULAR PdV e PdE
    setPdV((2 * Vigor) + Habilidade);
    setPdE(Percepcao + Inteligencia + Dominio);

    // 4. CALCULAR ATRIBUTOS FINAIS
    setAtributos({
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
    });

  }, [stats, racaPrimaria, racaSecundaria, classePrimaria, classeSecundaria, isHibrido, isSClasse, races, classes]);


  // Segundo useEffect: Calcula CAF e CAM (depende de atributos, PdAFisico, PdAMagico, etc.)
  useEffect(() => {
    const numPdAFisico = Number(PdAFisico) || 0;
    const numPdAMagico = Number(PdAMagico) || 0;
    const numStatsCAB = Number(stats.CAB) || 0;

    // Usar atributos do estado, que foram atualizados pelo primeiro useEffect e re-renderização
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

    setCAF(cafCalculado);
    setCAM(camCalculado);

  }, [PdAFisico, PdAMagico, classeDeArmaduraF, classeDeArmaduraM, atributos, stats.CAB]); // stats.CAB é uma dependência mais específica que 'stats' inteiro para este cálculo


  const handleCheckboxChangeHib = (event) => {
    setIsHibrido(event.target.checked);
    if (!event.target.checked) setRacaSecundaria(null);
  };

  const handleCheckboxChangeClass = (event) => {
    setIsSClasse(event.target.checked);
    if (!event.target.checked) setClasseSecundaria(null);
  };

  const handleStatChange = (event) => {
    const { name, value } = event.target;
    // Permitir campo vazio para o usuário apagar, mas converter para 0 se for o caso para o estado.
    // Ou manter string e converter apenas no cálculo como feito no useEffect. Decidi manter estado numérico.
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    setStats(prevStats => ({
      ...prevStats,
      [name]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setStatsShown(true);
  };

  const handleChangeF = (event) => {
    setClasseDeArmaduraF(Number(event.target.value));
  };

  const handleChangeM = (event) => {
    setClasseDeArmaduraM(Number(event.target.value));
  };

  const handlePdAFisicoChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setPdAFisico(isNaN(value) ? 0 : value);
  }

  const handlePdAMagicoChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setPdAMagico(isNaN(value) ? 0 : value);
  }
  // Adicione um handler para PdD se ele for um input
  // const handlePdDChange = (event) => {
  //   const value = parseInt(event.target.value, 10);
  //   setPdD(isNaN(value) ? 0 : value);
  // };

  const nomesRacas = races ? Object.keys(races) : [];
  const nomesClasses = classes ? Object.keys(classes) : [];
  const statusList = ['Vigor', 'Habilidade', 'Percepção', 'Inteligência', 'Domínio', 'CAB'];

  const tableRows = Object.keys(atributos).map((key) => {
    const atributoBaseCalculado = (atributos[key] || 0) - (bonusRaca[key] || 0) - (bonusClasse[key] || 0);
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      base: atributoBaseCalculado, // Pode precisar de ajuste fino aqui dependendo de como 'base' é definido
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
          {/* Seção de Raças e Classes */}
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
                sx={{ width: 300, backgroundColor: 'white', borderRadius: 1 }}
                renderInput={(params) => <TextField {...params} label="Raça" />}
              />
              {isHibrido && (
                <Autocomplete
                  value={racaSecundaria}
                  onChange={(event, newValue) => setRacaSecundaria(newValue)}
                  options={nomesRacas}
                  sx={{ width: 300, backgroundColor: 'white', borderRadius: 1 }}
                  renderInput={(params) => <TextField {...params} label="Segunda Raça" />}
                />
              )}
            </div>
            <div className='flex justify-evenly gap-4 mt-5 mb-5'>
              <Autocomplete
                value={classePrimaria}
                onChange={(event, newValue) => setClassePrimaria(newValue)}
                options={nomesClasses}
                sx={{ width: 300, backgroundColor: 'white', borderRadius: 1 }}
                renderInput={(params) => <TextField {...params} label="Classe" />}
              />
              {isSClasse && (
                <Autocomplete
                  value={classeSecundaria}
                  onChange={(event, newValue) => setClasseSecundaria(newValue)}
                  options={nomesClasses}
                  sx={{ width: 300, backgroundColor: 'white', borderRadius: 1 }}
                  renderInput={(params) => <TextField {...params} label="Segunda Classe" />}
                />
              )}
            </div>
          </div>
          {/* Seção de Status */}
          <section className='mt-10'>
            <div className='flex justify-center mb-5'>
              <h2 className='text-2xl'>Definição dos Status:</h2>
            </div>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
              {statusList.map((stat) => (
                <TextField
                  key={stat}
                  label={stat}
                  name={stat}
                  type="number"
                  value={stats[stat]} // Deve ser string aqui para o TextField controlar corretamente
                  onChange={handleStatChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '150px', backgroundColor: 'white', borderRadius: 1 }}
                  inputProps={{ min: "0" }}
                />
              ))}
            </Box>
            <Box>
              <div className='flex justify-center gap-5 mt-4'>
                <div>
                  <InputLabel id="classe-armadura-fisica-label" sx={{ color: 'white' }}>Classe de armadura física</InputLabel>
                  <Select
                    labelId="classe-armadura-fisica-label"
                    // label={"Classe de armadura física"} // Label já está no InputLabel
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
                  <InputLabel id="classe-armadura-magica-label" sx={{ color: 'white' }}>Classe de armadura Mágica</InputLabel>
                  <Select
                    labelId="classe-armadura-magica-label"
                    // label={"Classe de armadura mágica"}
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
                  <InputLabel sx={{ color: 'white' }}>PdA Físico</InputLabel>
                  <TextField
                    value={PdAFisico} // Controlado pelo estado
                    sx={{ backgroundColor: 'white', width: '300px', borderRadius: 1 }}
                    type="number"
                    onChange={handlePdAFisicoChange}
                    inputProps={{ min: "0" }}
                  />
                </div>
                <div>
                  <InputLabel sx={{ color: 'white' }}>PdA Mágico</InputLabel>
                  <TextField
                    value={PdAMagico} // Controlado pelo estado
                    sx={{ backgroundColor: 'white', width: '300px', borderRadius: 1 }}
                    type="number"
                    onChange={handlePdAMagicoChange}
                    inputProps={{ min: "0" }}
                  />
                </div>
              </div>
            </Box>
          </section>

          {/* Botão de Envio */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ padding: '10px 30px', fontSize: '1.1rem', backgroundColor: '#b91c1c', '&:hover': { backgroundColor: '#991b1b' } }}
            >
              Calcular Atributos
            </Button>
          </Box>
        </Box>

        {/* Tabela de Atributos */}
        {statsShown && (
          <Box
            sx={{ width: '1200px', borderRadius: '10px', padding: '20px', marginTop: '20px' }}
          >
            <Box className={"mb-5"}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell sx={{ color: 'red' }}>PdV</TableCell>
                      <TableCell sx={{ color: 'blue' }}>PdE</TableCell>
                      <TableCell sx={{ color: 'crimson' }}>PdA Físico</TableCell>
                      <TableCell sx={{ color: 'royalblue' }}>PdA Mágico</TableCell>
                      <TableCell sx={{ color: 'chocolate' }}>PdD</TableCell>
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
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell>CAF</TableCell>
                      <TableCell>CAM</TableCell>
                      <TableCell>CAB</TableCell>
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
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Atributo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Base</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Bônus Raça</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Bônus Classe</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row">{row.name}</TableCell>
                      <TableCell align="center">{row.base}</TableCell>
                      <TableCell align="center">{row.racaBonus}</TableCell>
                      <TableCell align="center">{row.classeBonus}</TableCell>
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