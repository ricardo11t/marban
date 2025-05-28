import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper } from '@mui/material';
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

  const [stats, setStats] = useState({
    Vigor: '', Habilidade: '', Percepção: '', Inteligência: '', Domínio: '', CAB: '',
  });

  const [bonusRaca, setBonusRaca] = useState({});
  const [bonusClasse, setBonusClasse] = useState({});
  const [atributos, setAtributos] = useState({});

  const { races } = useContext(RacesContext);
  const { classes } = useContext(ClassesContext);

  useEffect(() => {
    // 1. CALCULAR BÔNUS DE RAÇA (LÓGICA HÍBRIDA IMPLEMENTADA)
    const bonusRacaPrimaria = racaPrimaria && races[racaPrimaria] ? races[racaPrimaria].bonus : {};
    const bonusRacaSecundaria = racaSecundaria && races[racaSecundaria] ? races[racaSecundaria].bonus : {};

    const totalBonusRaca = {};
    // Itera sobre as chaves de bônus da raça primária para garantir que todos os atributos sejam cobertos.
    Object.keys(bonusRacaPrimaria).forEach(key => {
      const b1 = bonusRacaPrimaria[key] || 0;
      const b2 = bonusRacaSecundaria[key] || 0;

      // AQUI ESTÁ A NOVA LÓGICA
      if (isHibrido && racaSecundaria) {
        // Se for híbrido e tiver uma segunda raça, calcula a média dos bônus e arredonda para baixo.
        totalBonusRaca[key] = Math.floor((b1 + b2) / 2);
      } else {
        // Senão, usa apenas o bônus da raça primária.
        totalBonusRaca[key] = b1;
      }
    });
    setBonusRaca(totalBonusRaca);

    // 2. CALCULAR BÔNUS DE CLASSE (Lógica inalterada)
    const bonusClassePrimaria = classePrimaria && classes[classePrimaria] ? classes[classePrimaria].bonus : {};
    const bonusClasseSecundaria = classeSecundaria && classes[classeSecundaria] ? classes[classeSecundaria].bonus : {};

    const totalBonusClasse = {};
    // Garante que a iteração funcione mesmo que o objeto de bônus esteja vazio
    const classeKeys = Object.keys(bonusClassePrimaria).length > 0 ? Object.keys(bonusClassePrimaria) : Object.keys(bonusClasseSecundaria);
    classeKeys.forEach(key => {
      totalBonusClasse[key] = (bonusClassePrimaria[key] || 0) + (bonusClasseSecundaria[key] || 0);
    });
    setBonusClasse(totalBonusClasse);

    // 3. CALCULAR ATRIBUTOS FINAIS
    const Vigor = Number(stats.Vigor) || 0;
    const Habilidade = Number(stats.Habilidade) || 0;
    const Percepção = Number(stats.Percepção) || 0;
    const Inteligência = Number(stats.Inteligência) || 0;
    const Domínio = Number(stats.Domínio) || 0;

    setAtributos({
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
    });

  }, [stats, racaPrimaria, racaSecundaria, classePrimaria, classeSecundaria, isHibrido, races, classes]); // Adicionado isHibrido às dependências


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
    const numericValue = value === '' ? '' : Math.max(0, parseInt(value, 10));
    setStats({
      ...stats,
      [name]: numericValue,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Suas validações...
    setStatsShown(true);
  };

  const nomesRacas = Object.keys(races || {});
  const nomesClasses = Object.keys(classes || {});
  const statusList = ['Vigor', 'Habilidade', 'Percepção', 'Inteligência', 'Domínio', 'CAB'];

  const tableRows = Object.keys(atributos).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    base: atributos[key] - (bonusRaca[key] || 0) - (bonusClasse[key] || 0),
    racaBonus: bonusRaca[key] || 0,
    classeBonus: bonusClasse[key] || 0,
    total: atributos[key]
  }));

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
                  value={stats[stat]}
                  onChange={handleStatChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '150px', backgroundColor: 'white', borderRadius: 1 }}
                  inputProps={{ min: "0" }}
                />
              ))}
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