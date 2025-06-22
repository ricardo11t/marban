import React, { useContext, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RacesContext } from '../context/RacesProvider';
import {
    Card, CardContent, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress,
    Autocomplete
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthProvider';

// --- Constantes de Configuração ---

const bonusFieldsForAttributeOptions = {
    forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
    agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
};
const attributeKeys = Object.keys(bonusFieldsForAttributeOptions);
const attributeOptions = attributeKeys.map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}));

const initialFormState = {
    nome: '', // Top-level
    bonus: { ...bonusFieldsForAttributeOptions }, // Top-level
    pdd: { PdDFixo: 0, PdDFração: 0, AtributoUtilizado: null } // Top-level
};

const filledTextFieldStyles = {
    '& .MuiFilledInput-root': {
        backgroundColor: '#601b1c', color: 'white', borderTopLeftRadius: 4, borderTopRightRadius: 4,
        '&:hover': { backgroundColor: '#752d2e' },
        '&.Mui-focused': { backgroundColor: '#601b1c' },
        '&:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.2)' },
        '&:after': { borderBottom: '2px solid white' },
        '&.Mui-disabled': { backgroundColor: 'rgba(96, 27, 28, 0.5)', color: 'rgba(255, 255, 255, 0.5)' }
    },
    '& .MuiFilledInput-input': { color: 'white', '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 1000px #601b1c inset !important', WebkitTextFillColor: 'white !important', caretColor: 'white !important' }, },
    '& label.MuiInputLabel-filled': { color: 'rgba(255, 255, 255, 0.7)' },
    '& label.MuiInputLabel-filled.Mui-focused': { color: 'white' },
    '& label.MuiInputLabel-filled.Mui-disabled': { color: 'rgba(255, 255, 255, 0.4)' }
};

const attributeLabels = {
    forca: "Força", resFisica: "Res. Física", resMental: "Res. Mental",
    manipulacao: "Manipulação", resMagica: "Res. Mágica", sobrevivencia: "Sobrevivência",
    agilidade: "Agilidade", destreza: "Destreza", competencia: "Competência",
    criatividade: "Criatividade", sorte: "Sorte"
};

const API_BASE_URL = '/api';

const Races = () => {
    const { races, isLoading: isLoadingRaces, error: racesError, refetchRaces } = useContext(RacesContext);
    const { isAdmin, axiosInstance } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingRaceName, setEditingRaceName] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormState);
            setEditingRaceName(null);
        }
    }, [open]);

    const handleOpenAdd = () => {
        setEditingRaceName(null);
        setFormData(initialFormState);
        setOpen(true);
    };

    const handleOpenEdit = (raceObject) => {
        if (!raceObject || typeof raceObject.name === 'undefined' || !raceObject.raceData) {
            Swal.fire('Erro', 'Dados da raça inválidos para edição.', 'error');
            return;
        }

        const currentRaceName = raceObject.name;
        setEditingRaceName(currentRaceName);

        setFormData({
            nome: currentRaceName,
            bonus: { ...initialFormState.bonus, ...(raceObject.raceData.bonus || {}) },
            pdd: { ...initialFormState.pdd, ...(raceObject.raceData.pdd || {}) }
        });
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleFormChange = (event, value, fieldName) => {
        if (fieldName === 'AtributoUtilizado') {
            console.log('Updating AtributoUtilizado to:', value ? value.value : null);
            setFormData(prev => ({
                ...prev,
                pdd: { ...prev.pdd, AtributoUtilizado: value ? value.value : null }
            }));
        } else {
            const { name, value: inputValue } = event.target;

            const isBonusField = Object.keys(initialFormState.bonus).includes(name);
            const isPdDField = Object.keys(initialFormState.pdd).includes(name) && name !== 'AtributoUtilizado';

            if (name === 'nome') {
                console.log('Updating nome to:', inputValue);
                setFormData(prev => ({ ...prev, nome: inputValue }));
            } else if (isBonusField) {
                console.log(`Updating bonus.${name} to:`, Number(inputValue) || 0);
                setFormData(prev => ({
                    ...prev,
                    bonus: { ...prev.bonus, [name]: Number(inputValue) || 0 }
                }));
            } else if (isPdDField) {
                console.log(`Updating pdd.${name} to:`, Number(inputValue) || 0);
                setFormData(prev => ({
                    ...prev,
                    pdd: { ...prev.pdd, [name]: Number(inputValue) || 0 }
                }));
            } else {
                console.warn(`No matching field found for input with name: ${name}`);
            }
        }
    };

    const getAutocompleteValue = (attributeValue) => {
        if (!attributeValue) return null;
        return attributeOptions.find(option => option.value === attributeValue) || null;
    };

    const handleSaveRace = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            Swal.fire('Erro de Autenticação', 'Você não está logado ou sua sessão expirou.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (!formData.nome.trim()) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da raça não pode ser vazio.' });
                setIsSubmitting(false); return;
            }
            if ((formData.pdd.PdDFixo > 0 || formData.pdd.PdDFração > 0) && !formData.pdd.AtributoUtilizado) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'Se PdD Fixo ou Fração for maior que zero, o Atributo Utilizado deve ser selecionado.' });
                setIsSubmitting(false); return;
            }

            let url;
            let method;
            let body;
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

            const racePayload = {
                name: formData.nome.trim(),
                raceData: {
                    bonus: formData.bonus,
                    pdd: formData.pdd
                }
            };

            if (editingRaceName) {
                method = 'PUT';
                url = `${API_BASE_URL}/races/${encodeURIComponent(editingRaceName)}?name=${encodeURIComponent(editingRaceName)}`;
                body = JSON.stringify(racePayload.raceData);
            } else {
                method = 'POST';
                url = `${API_BASE_URL}/races`;
                body = JSON.stringify(racePayload);
            }

            const response = await fetch(url, { method, headers, body });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
                throw new Error(errorData.message || `Erro ao salvar raça: ${response.statusText}`);
            }

            await refetchRaces();
            handleClose();
            Swal.fire({ icon: 'success', title: editingRaceName ? 'Atualizado!' : 'Criado!', text: `A raça "${formData.nome.trim()}" foi salva com sucesso.`, showConfirmButton: false, timer: 1500 });
        } catch (error) {
            console.error("Erro ao salvar raça:", error);
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Algo deu errado ao salvar a raça!', footer: `Erro: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (raceNameString) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            Swal.fire('Erro de Autenticação', 'Você não está logado.', 'error');
            return;
        }
        Swal.fire({
            title: `Deletar ${raceNameString}?`, text: `Você não poderá reverter a exclusão!`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6', confirmButtonText: 'Sim, deletar!', cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/races/${encodeURIComponent(raceNameString)}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }
                    await refetchRaces();
                    Swal.fire('Deletado!', `A raça "${raceNameString}" foi deletada.`, 'success');
                } catch (error) {
                    console.error("Erro ao deletar raça:", error);
                    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Algo deu errado!', footer: `Erro: ${error.message}` });
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-8">
                    <Typography variant='h3' component="h1" className='font-bold text-center mb-10'>Raças</Typography>
                    <div className='flex justify-start mb-6 max-[450px]:justify-center'>
                        {isAdmin() && (
                            <Button variant='contained' sx={{ backgroundColor: '#601b1c', '&:hover': { backgroundColor: '#501b1c' } }} onClick={handleOpenAdd}>
                                Adicionar nova Raça
                            </Button>
                        )}
                    </div>
                    <div className='flex flex-wrap justify-center gap-6 mb-10'>
                        {isLoadingRaces && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}><CircularProgress sx={{ color: '#601b1c' }} size={60} /></Box>}
                        {racesError && <Typography color="error" className="w-full text-center">Erro ao carregar raças: {racesError}</Typography>}

                        {!isLoadingRaces && !racesError && races && races.length > 0 ? (
                            races.map((raceItem) => {
                                if (!raceItem || !raceItem.name || !raceItem.raceData) {
                                    console.warn("Item de raça inválido:", raceItem);
                                    return null;
                                }

                                const raceNameKey = raceItem.name;
                                const atributoUtilizadoLabel = raceItem.raceData.pdd?.AtributoUtilizado
                                    ? (attributeOptions.find(opt => opt.value === raceItem.raceData.pdd.AtributoUtilizado)?.label || raceItem.raceData.pdd.AtributoUtilizado)
                                    : 'N/A';

                                return (
                                    <Card key={raceNameKey} sx={{ backgroundColor: '#601b1c', color: 'white', width: 320, display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                                        <CardContent className='text-center flex-grow'>
                                            <Typography variant='h5' component="div" sx={{ color: 'white', mb: 2 }} className='capitalize'>{raceNameKey}</Typography>

                                            {raceItem.raceData.bonus && Object.values(raceItem.raceData.bonus).some(v => v !== 0) && (
                                                <>
                                                    <Typography variant='subtitle1' sx={{ color: 'rgba(255,255,255,0.9)', mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                                                    <Box className='grid grid-cols-2 gap-x-4 gap-y-1 px-2'>
                                                        {Object.entries(raceItem.raceData.bonus)
                                                            .filter(([_, valor]) => valor !== 0)
                                                            .map(([atributo, valor]) => (
                                                                <Typography key={atributo} variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>
                                                                    <span className='capitalize'>{attributeLabels[atributo] || atributo}:</span>
                                                                    <span style={{ color: valor > 0 ? 'lightgreen' : 'lightcoral', marginLeft: '4px', fontWeight: 'bold' }}>
                                                                        {valor > 0 ? `+${valor}` : valor}
                                                                    </span>
                                                                </Typography>
                                                            ))}
                                                    </Box>
                                                </>
                                            )}

                                            {raceItem.raceData.pdd && (raceItem.raceData.pdd.PdDFixo !== 0 || raceItem.raceData.pdd.PdDFração !== 0 || raceItem.raceData.pdd.AtributoUtilizado) && (
                                                <>
                                                    <Typography variant='subtitle1' sx={{ color: 'rgba(255,255,255,0.9)', mt: 2, mb: 1, fontWeight: 'bold' }}>Pontos de Deslocamento:</Typography>
                                                    <Box sx={{ textAlign: 'left', pl: 3, pr: 2 }}>
                                                        {raceItem.raceData.pdd.PdDFixo !== 0 && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Fixo: {raceItem.raceData.pdd.PdDFixo}</Typography>}
                                                        {raceItem.raceData.pdd.PdDFração !== 0 && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Fração: {raceItem.raceData.pdd.PdDFração}</Typography>}
                                                        {raceItem.raceData.pdd.AtributoUtilizado && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Atributo: {atributoUtilizadoLabel}</Typography>}
                                                    </Box>
                                                </>
                                            )}
                                        </CardContent>
                                        {isAdmin() &&
                                            <Box className='flex justify-end gap-1 p-2 mt-auto border-t border-gray-700'>
                                                <Button size="small" onClick={() => handleOpenEdit(raceItem)} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}><Edit fontSize="small" /></Button>
                                                <Button size="small" onClick={() => handleDelete(raceNameKey)} sx={{ color: 'lightcoral', '&:hover': { backgroundColor: 'rgba(255,100,100,0.1)' } }}><Delete fontSize="small" /></Button>
                                            </Box>}
                                    </Card>
                                );
                            })
                        ) : (
                            !isLoadingRaces && !racesError && <Typography className='w-full text-center'>Nenhuma raça encontrada.</Typography>
                        )}
                    </div>
                </div>

                {/* --- DIALOG --- */}
                <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveRace(); }, sx: { backgroundColor: 'black', color: 'white', minWidth: { xs: '90%', sm: '400px', md: '500px' }, borderRadius: 2 } }}>
                    <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {editingRaceName ? `Editar Raça: ${editingRaceName}` : 'Adicionar Nova Raça'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: '20px !important' }}>
                        {/* Corrected onChange */}
                        <TextField autoFocus={!editingRaceName} required margin="dense" id="racename" name="nome" label="Nome da Raça" type="text" fullWidth variant="filled" value={formData.nome} onChange={handleFormChange} disabled={!!editingRaceName} sx={filledTextFieldStyles} />
                        <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                            {Object.keys(formData.bonus).map(bonusKey => (
                                // Corrected onChange
                                <TextField
                                    key={bonusKey} margin="dense" id={bonusKey} name={bonusKey}
                                    label={attributeOptions.find(opt => opt.value === bonusKey)?.label || bonusKey}
                                    type="number" variant="filled"
                                    value={formData.bonus[bonusKey]}
                                    onChange={handleFormChange} // <--- Added/Confirmed
                                    sx={filledTextFieldStyles}
                                />
                            ))}
                        </Box>
                        <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>Pontos de Deslocamento (PdD):</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', alignItems: 'flex-start' }}>
                            {/* Corrected onChange */}
                            <TextField margin="dense" id="PdDFixo" name="PdDFixo" label="PdD Fixo" type="number" variant="filled"
                                value={formData.pdd.PdDFixo}
                                onChange={handleFormChange} // <--- Added/Confirmed
                                sx={filledTextFieldStyles}
                            />
                            {/* Corrected onChange */}
                            <TextField margin="dense" id="PdDFração" name="PdDFração" label="PdD Fração (Valor)" type="number" variant="filled"
                                value={formData.pdd.PdDFração}
                                onChange={handleFormChange} // <--- Added/Confirmed
                                sx={filledTextFieldStyles}
                            />
                            <Autocomplete id="AtributoUtilizado" options={attributeOptions} getOptionLabel={(option) => option.label || ""}
                                value={getAutocompleteValue(formData.pdd.AtributoUtilizado)}
                                onChange={(event, newValue) => handleFormChange(event, newValue, 'AtributoUtilizado')}
                                isOptionEqualToValue={(option, value) => option.value === value?.value}
                                renderInput={(params) => (<TextField {...params} label="Atributo para Fração PdD" variant="filled" margin="dense" sx={filledTextFieldStyles} />)}
                                PaperComponentProps={{ sx: { backgroundColor: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.2)' } }}
                                sx={{ gridColumn: 'span 2', '& .MuiAutocomplete-option': { color: 'white', '&[aria-selected="true"]': { backgroundColor: 'rgba(255, 255, 255, 0.2) !important' }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1) !important' }, }, '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} variant="contained" sx={{ backgroundColor: '#007bff', color: 'white', '&:hover': { backgroundColor: '#0056b3' }, '&.Mui-disabled': { backgroundColor: 'rgba(0, 123, 255, 0.3)', color: 'rgba(255,255,255,0.5)' } }}>
                            {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (editingRaceName ? 'Salvar Alterações' : 'Criar Raça')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            <Footer />
        </>
    );
}

export default Races;