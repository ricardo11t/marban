import React, { useContext, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RacesContext } from '../context/RacesProvider';
import {
    Card, CardContent, CardMedia, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress,
    Autocomplete
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
    },
    pdd: { PdDFixo: 0, PdDFração: 0, AtributoUtilizado: null } // Já está 'pdd' (minúsculo) - Ótimo!
};

const attributeKeys = Object.keys(initialFormState.bonus);
const attributeOptions = attributeKeys.map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}));


const Races = () => {
    const { races, refetchRaces } = useContext(RacesContext);
    const nomesDasRacas = Object.keys(races || {});

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingRaceName, setEditingRaceName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenAdd = () => {
        setEditingRaceName(null);
        setFormData(initialFormState);
        setOpen(true);
    };

    const handleOpenEdit = (nome) => {
        setEditingRaceName(nome);
        const raceData = races[nome];
        setFormData({
            nome,
            bonus: { ...(raceData.bonus || initialFormState.bonus) },
            pdd: { ...(raceData.pdd || initialFormState.pdd) } // Já usa 'pdd' (minúsculo) - Ótimo!
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFormChange = (event, value, fieldName) => {
        if (fieldName === 'AtributoUtilizado') {
            setFormData(prev => ({
                ...prev,
                pdd: { ...prev.pdd, AtributoUtilizado: value ? value.value : null } // Já usa 'pdd' (minúsculo) - Ótimo!
            }));
        } else {
            const { name, value: inputValue } = event.target;
            const isBonusField = Object.keys(initialFormState.bonus).includes(name);
            // As chaves internas de pdd (PdDFixo, etc.) continuam com seu casing original
            const isPdDField = Object.keys(initialFormState.pdd).includes(name) && name !== 'AtributoUtilizado';

            if (name === 'nome') {
                setFormData(prev => ({ ...prev, nome: inputValue }));
            } else if (isBonusField) {
                setFormData(prev => ({
                    ...prev,
                    bonus: { ...prev.bonus, [name]: Number(inputValue) || 0 },
                }));
            } else if (isPdDField) {
                setFormData(prev => ({
                    ...prev,
                    pdd: { ...prev.pdd, [name]: Number(inputValue) || 0 } // Já usa 'pdd' (minúsculo) - Ótimo!
                }));
            }
        }
    };


    const handleSaveRace = async () => {
        setIsLoading(true);
        try {
            const raceDataToSave = {
                name: editingRaceName ? formData.nome : formData.nome.toLowerCase(),
                bonus: formData.bonus,
                pdd: formData.pdd // <<< CORRIGIDO AQUI: de 'PdD' para 'pdd'
            };

            if (!raceDataToSave.name.trim()) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da raça não pode ser vazio.' });
                setIsLoading(false);
                return;
            }

            if (formData.pdd.PdDFixo > 0 || formData.pdd.PdDFração > 0) {
                if (!formData.pdd.AtributoUtilizado) {
                    Swal.fire({ icon: 'error', title: 'Erro!', text: 'Se PdD Fixo ou Fração for maior que zero, o Atributo Utilizado para PdD deve ser selecionado.' });
                    setIsLoading(false);
                    return;
                }
            }

            await fetch('/api/races', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(raceDataToSave)
            });

            await refetchRaces();
            handleClose();

            Swal.fire({
                icon: 'success',
                title: 'Salvo!',
                text: `A raça "${raceDataToSave.name}" foi salva com sucesso.`,
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error("Erro ao salvar raça:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Algo deu errado ao salvar a raça!',
                footer: `Erro: ${error.message}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (raceName) => {
        Swal.fire({
            title: 'Tem certeza?',
            text: `Você não poderá reverter a exclusão da raça "${raceName}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/races?name=${encodeURIComponent(raceName)}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }
                    await refetchRaces();
                    Swal.fire(
                        'Deletado!',
                        `A raça "${raceName}" foi deletada.`,
                        'success'
                    );
                } catch (error) {
                    console.error("Erro ao deletar raça:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Algo deu errado ao deletar a raça!',
                        footer: `Erro: ${error.message}`
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const getAutocompleteValue = (attributeValue) => {
        if (!attributeValue) return null;
        return attributeOptions.find(option => option.value === attributeValue) || null;
    };


    return (
        <>
            <Header />
            <div>
                <div><h1 className='text-5xl font-bold text-center text-white mt-10 mb-10'>Raças</h1></div>
                <div className='flex justify-start ml-10 mb-4'>
                    <Button variant='contained' sx={{ backgroundColor: '#601b1c', '&:hover': { backgroundColor: '#b91c1c' } }} onClick={handleOpenAdd}>
                        Adicionar nova Raça
                    </Button>
                </div>
                <div className='flex flex-wrap justify-center gap-6 mb-10'>
                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress /></Box>}
                    {!isLoading && nomesDasRacas.length > 0 ? (
                        nomesDasRacas.map((nome) => {
                            const race = races[nome];
                            if (!race) return null;

                            // ATUALIZADO AQUI para race.pdd
                            const atributoUtilizadoLabel = race.pdd?.AtributoUtilizado
                                ? (attributeOptions.find(opt => opt.value === race.pdd.AtributoUtilizado)?.label || race.pdd.AtributoUtilizado)
                                : 'N/A';

                            return (
                                <Card key={nome} sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent className='text-center flex-grow'>
                                        <Typography variant='h5' component="div" className='capitalize'>{nome}</Typography>

                                        {race.bonus && Object.values(race.bonus).some(v => v !== 0) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                                                <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                                    {Object.entries(race.bonus)
                                                        .filter(([_, valor]) => valor !== 0)
                                                        .map(([atributo, valor]) => (
                                                            <Typography key={atributo} variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
                                                                <span className='capitalize'>{attributeOptions.find(opt => opt.value === atributo)?.label || atributo}:</span>
                                                                <span style={{ color: valor > 0 ? 'green' : 'red', marginLeft: '4px', fontWeight: 'bold' }}>
                                                                    {valor > 0 ? `+${valor}` : valor}
                                                                </span>
                                                            </Typography>
                                                        ))}
                                                </Box>
                                            </>
                                        )}

                                        {/* ATUALIZADO AQUI para race.pdd */}
                                        {race.pdd && (race.pdd.PdDFixo !== 0 || race.pdd.PdDFração !== 0 || race.pdd.AtributoUtilizado) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Pontos de Deslocamento:</Typography>
                                                <Box sx={{ textAlign: 'left', pl: 1 }}>
                                                    {/* ATUALIZADO AQUI para race.pdd */}
                                                    {race.pdd.PdDFixo !== undefined && race.pdd.PdDFixo !== 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fixo: {race.pdd.PdDFixo}</Typography>}
                                                    {race.pdd.PdDFração !== undefined && race.pdd.PdDFração !== 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fração: {race.pdd.PdDFração}</Typography>}
                                                    {race.pdd.AtributoUtilizado && <Typography variant="body2" sx={{ color: 'text.secondary' }}>Atributo: {atributoUtilizadoLabel}</Typography>}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                    <Box className='flex justify-end gap-2 p-2 mt-auto'>
                                        <Button size="small" onClick={() => handleOpenEdit(nome)}><Edit /></Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(nome)}><Delete /></Button>
                                    </Box>
                                </Card>
                            )
                        })
                    ) : (
                        !isLoading && <p className='text-white'>Nenhuma raça encontrada.</p>
                    )}
                </div>
            </div>

            <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveRace(); } }}>
                <DialogTitle>{editingRaceName ? 'Editar Raça' : 'Adicionar Nova Raça'}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {editingRaceName ? `Modifique as informações da raça ${editingRaceName}.` : 'Preencha as informações da nova raça.'}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="nome"
                        label="Nome da Raça"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={formData.nome}
                        onChange={handleFormChange}
                        disabled={!!editingRaceName}
                    />

                    <Typography variant='subtitle1' sx={{ mt: 3, mb: 0 }}>Bônus da Raça:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        {Object.keys(formData.bonus).map(bonusKey => (
                            <TextField
                                key={bonusKey}
                                margin="dense"
                                id={bonusKey}
                                name={bonusKey}
                                label={attributeOptions.find(opt => opt.value === bonusKey)?.label || bonusKey}
                                type="number"
                                variant="standard"
                                value={formData.bonus[bonusKey]}
                                onChange={handleFormChange}
                            />
                        ))}
                    </Box>

                    <Typography variant='subtitle1' sx={{ mt: 3, mb: 0 }}>Pontos de Deslocamento (PdD):</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', alignItems: 'flex-end' }}>
                        <TextField
                            margin="dense"
                            id="PdDFixo"
                            name="PdDFixo" // O 'name' do input TextField pode continuar assim para o handleFormChange
                            label="PdD Fixo"
                            type="number"
                            variant="standard"
                            value={formData.pdd.PdDFixo} // <<< ATUALIZADO AQUI
                            onChange={handleFormChange}
                        />
                        <TextField
                            margin="dense"
                            id="PdDFração"
                            name="PdDFração" // O 'name' do input TextField pode continuar assim
                            label="PdD Fração (JÁCALCULADOPFV)" // Removi o "(JÁ CALCULADOPFV)" para limpeza
                            type="number"
                            variant="standard"
                            value={formData.pdd.PdDFração} // <<< ATUALIZADO AQUI
                            onChange={handleFormChange}
                        />
                        <Autocomplete
                            id="AtributoUtilizado"
                            options={attributeOptions}
                            getOptionLabel={(option) => option.label || ""}
                            value={getAutocompleteValue(formData.pdd.AtributoUtilizado)} // <<< ATUALIZADO AQUI
                            onChange={(event, newValue) => {
                                handleFormChange(event, newValue, 'AtributoUtilizado');
                            }}
                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Atributo Utilizado p/ PdD"
                                    variant="standard"
                                    margin="dense"
                                />
                            )}
                            sx={{ gridColumn: 'span 2', mt: 'dense' === 'dense' ? 1.3 : 0 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 2, pb: 2, pr: 2 }}>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading} variant="contained">
                        {isLoading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </>
    )
}

export default Races;