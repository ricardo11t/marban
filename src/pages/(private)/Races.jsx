import React, { useContext, useState } from 'react';
import Header from '.../components/Header';
import Footer from '.../components/Footer';
import { RacesContext } from '.../context/RacesProvider';
import {
    Card, CardContent, CardMedia, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress,
    Autocomplete,
    InputLabel
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
    },
    pdd: { PdDFixo: 0, PdDFração: 0, AtributoUtilizado: null }
};

const attributeKeys = Object.keys(initialFormState.bonus);
const attributeOptions = attributeKeys.map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}));

// Estilos para os TextFields com variant="filled"
const filledTextFieldStyles = {
    '& .MuiFilledInput-root': {
        backgroundColor: '#601b1c',
        color: 'white',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        '&:hover': {
            backgroundColor: '#752d2e', // Um pouco mais escuro/diferente no hover
        },
        '&.Mui-focused': {
            backgroundColor: '#601b1c',
        },
        // Remover a linha inferior padrão da variante "filled" para um visual mais limpo
        // ou estilizá-la se preferir
        '&:before': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '&:after': {
            borderBottom: '2px solid white', // Linha branca quando focado
        },
        '&.Mui-disabled': { // Estilo para campo desabilitado
            backgroundColor: 'rgba(96, 27, 28, 0.5)', // #601b1c com opacidade
            color: 'rgba(255, 255, 255, 0.5)',
        }
    },
    '& .MuiFilledInput-input': {
        color: 'white',
        '&:-webkit-autofill': { // Estilo para remover o autofill padrão do browser
            WebkitBoxShadow: '0 0 0 1000px #601b1c inset !important',
            WebkitTextFillColor: 'white !important',
            caretColor: 'white !important',
        },
    },
    '& label.MuiInputLabel-filled': { // Para o label
        color: 'rgba(255, 255, 255, 0.7)',
    },
    '& label.MuiInputLabel-filled.Mui-focused': { // Label focado
        color: 'white',
    },
    '& label.MuiInputLabel-filled.Mui-disabled': { // Label desabilitado
        color: 'rgba(255, 255, 255, 0.4)',
    }
};


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
            pdd: { ...(raceData.pdd || initialFormState.pdd) }
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
                pdd: { ...prev.pdd, AtributoUtilizado: value ? value.value : null }
            }));
        } else {
            const { name, value: inputValue } = event.target;
            const isBonusField = Object.keys(initialFormState.bonus).includes(name);
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
                    pdd: { ...prev.pdd, [name]: Number(inputValue) || 0 }
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
                pdd: formData.pdd
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
                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress sx={{ color: '#601b1c' }} /></Box>}
                    {!isLoading && nomesDasRacas.length > 0 ? (
                        nomesDasRacas.map((nome) => {
                            const race = races[nome];
                            if (!race) return null;

                            const atributoUtilizadoLabel = race.pdd?.AtributoUtilizado
                                ? (attributeOptions.find(opt => opt.value === race.pdd.AtributoUtilizado)?.label || race.pdd.AtributoUtilizado)
                                : 'N/A';

                            return (
                                <Card key={nome} sx={{ backgroundColor: '#601b1c', width: 320, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent className='text-center flex-grow'>
                                        <Typography variant='h5' component="div" sx={{ color: 'white' }} className='capitalize'>{nome}</Typography>

                                        {race.bonus && Object.values(race.bonus).some(v => v !== 0) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ color: 'white', mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                                                <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                                    {Object.entries(race.bonus)
                                                        .filter(([_, valor]) => valor !== 0)
                                                        .map(([atributo, valor]) => (
                                                            <Typography key={atributo} variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>
                                                                <span className='capitalize'>{attributeOptions.find(opt => opt.value === atributo)?.label || atributo}:</span>
                                                                <span style={{ color: valor > 0 ? 'lightgreen' : 'lightcoral', marginLeft: '4px', fontWeight: 'bold' }}>
                                                                    {valor > 0 ? `+${valor}` : valor}
                                                                </span>
                                                            </Typography>
                                                        ))}
                                                </Box>
                                            </>
                                        )}

                                        {race.pdd && (race.pdd.PdDFixo !== 0 || race.pdd.PdDFração !== 0 || race.pdd.AtributoUtilizado) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ color: 'white', mt: 2, mb: 1, fontWeight: 'bold' }}>Pontos de Deslocamento:</Typography>
                                                <Box sx={{ textAlign: 'left', pl: 1 }}>
                                                    {race.pdd.PdDFixo !== undefined && race.pdd.PdDFixo !== 0 && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Fixo: {race.pdd.PdDFixo}</Typography>}
                                                    {race.pdd.PdDFração !== undefined && race.pdd.PdDFração !== 0 && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Fração: {race.pdd.PdDFração}</Typography>}
                                                    {race.pdd.AtributoUtilizado && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Atributo: {atributoUtilizadoLabel}</Typography>}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                    <Box className='flex justify-end gap-2 p-2 mt-auto'>
                                        <Button size="small" onClick={() => handleOpenEdit(nome)} sx={{ color: 'white' }}><Edit /></Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(nome)} sx={{ color: 'lightcoral' }}><Delete /></Button>
                                    </Box>
                                </Card>
                            )
                        })
                    ) : (
                        !isLoading && <p className='text-white'>Nenhuma raça encontrada.</p>
                    )}
                </div>
            </div>

            {/* ========== APLICAÇÃO DOS ESTILOS NO DIALOG ABAIXO ========== */}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (e) => { e.preventDefault(); handleSaveRace(); },
                    sx: { // Estilo do Paper do Dialog
                        backgroundColor: 'black',
                        color: 'white',
                        minWidth: '400px', // Largura mínima para melhor visualização
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {editingRaceName ? 'Editar Raça' : 'Adicionar Nova Raça'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, mt: 1 }}>
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
                        variant="filled" // Alterado para "filled"
                        value={formData.nome}
                        onChange={handleFormChange}
                        disabled={!!editingRaceName}
                        sx={filledTextFieldStyles} // Aplicando estilos
                    />

                    <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Bônus da Raça:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        {Object.keys(formData.bonus).map(bonusKey => (
                            <React.Fragment key={bonusKey}> {/* Usar React.Fragment para chave aqui */}
                                {/* O InputLabel já está embutido no TextField com variant="filled" */}
                                <TextField
                                    margin="dense"
                                    id={bonusKey}
                                    name={bonusKey}
                                    label={attributeOptions.find(opt => opt.value === bonusKey)?.label || bonusKey}
                                    type="number"
                                    variant="filled" // Alterado para "filled"
                                    value={formData.bonus[bonusKey]}
                                    onChange={handleFormChange}
                                    sx={filledTextFieldStyles} // Aplicando estilos
                                />
                            </React.Fragment>
                        ))}
                    </Box>

                    <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Pontos de Deslocamento (PdD):
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', alignItems: 'flex-start' }}>
                        <TextField
                            margin="dense"
                            id="PdDFixo"
                            name="PdDFixo"
                            label="PdD Fixo"
                            type="number"
                            variant="filled" // Alterado para "filled"
                            value={formData.pdd.PdDFixo}
                            onChange={handleFormChange}
                            sx={filledTextFieldStyles} // Aplicando estilos
                        />
                        <TextField
                            margin="dense"
                            id="PdDFração"
                            name="PdDFração"
                            label="PdD Fração (JÁCALCULADOPFV)"
                            type="number"
                            variant="filled" // Alterado para "filled"
                            value={formData.pdd.PdDFração}
                            onChange={handleFormChange}
                            sx={filledTextFieldStyles} // Aplicando estilos
                        />
                        <Autocomplete
                            id="AtributoUtilizado"
                            options={attributeOptions}
                            getOptionLabel={(option) => option.label || ""}
                            value={getAutocompleteValue(formData.pdd.AtributoUtilizado)}
                            onChange={(event, newValue) => {
                                handleFormChange(event, newValue, 'AtributoUtilizado');
                            }}
                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Atributo Utilizado p/ PdD"
                                    variant="filled" // Alterado para "filled"
                                    margin="dense"
                                    sx={filledTextFieldStyles} // Aplicando estilos
                                />
                            )}
                            // Estilos para o popup do Autocomplete
                            PaperComponentProps={{
                                sx: {
                                    backgroundColor: 'black',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }
                            }}
                            // Estilos para as opções do Autocomplete
                            sx={{
                                gridColumn: 'span 2',
                                '& .MuiAutocomplete-option': {
                                    color: 'white', // Cor do texto da opção
                                    '&[aria-selected="true"]': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                                    },
                                },
                                // Estilo para o botão de limpar (X) e dropdown arrow
                                '& .MuiSvgIcon-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 2, pb: 2, pr: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} variant="contained" sx={{
                        backgroundColor: '#007bff', // Azul padrão para "Salvar", pode mudar para #601b1c se preferir
                        color: 'white',
                        '&:hover': { backgroundColor: '#0056b3' },
                        '&.Mui-disabled': { backgroundColor: 'rgba(0, 123, 255, 0.5)' }
                    }}>
                        {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </>
    )
}

export default Races;