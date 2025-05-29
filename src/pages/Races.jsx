import React, { useContext, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RacesContext } from '../context/RacesProvider';
import {
    Card, CardContent, CardMedia, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

// 1. Importar o SweetAlert2
import Swal from 'sweetalert2';

// Estrutura inicial para uma nova raça ou para limpar o formulário
const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
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
        setFormData({ nome, bonus: races[nome].bonus });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        if (name === 'nome') {
            setFormData(prev => ({ ...prev, nome: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                bonus: { ...prev.bonus, [name]: Number(value) || 0 }
            }));
        }
    };

    // --- FUNÇÕES CRUD COM SWEETALERT2 ---

    const handleSaveRace = async () => {
        setIsLoading(true);
        try {
            // Prepara o objeto para a raça individual que está sendo salva/editada
            const raceDataToSave = {
                // Garante que o nome seja enviado em minúsculas se for uma nova raça
                // Se for edição, o nome já deve estar correto no formData
                name: editingRaceName ? formData.nome : formData.nome.toLowerCase(),
                bonus: formData.bonus
            };

            // Validação simples para o nome
            if (!raceDataToSave.name.trim()) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da raça não pode ser vazio.' });
                setIsLoading(false);
                return;
            }

            await fetch('/api/races', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(raceDataToSave) // Envia apenas a raça sendo adicionada/editada
            });

            await refetchRaces(); // Função do seu RacesContext
            handleClose(); // Fecha o Dialog

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
                    // A API agora espera o nome como um query parameter para DELETE
                    const response = await fetch(`/api/races?name=${encodeURIComponent(raceName)}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        // Tenta pegar a mensagem de erro do backend se houver
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }

                    await refetchRaces(); // Função do seu RacesContext

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

    return (
        <>
            <Header />
            <div>
                <div><h1 className='text-5xl font-bold text-center mt-10 mb-10'>Raças</h1></div>
                <div className='flex justify-start ml-10 mb-4'>
                    <Button variant='contained' sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: '#b91c1c' } }} onClick={handleOpenAdd}>
                        Adicionar nova Raça
                    </Button>
                </div>
                <div className='flex flex-wrap justify-center gap-6 mb-10'>
                    {isLoading && <CircularProgress />}
                    {!isLoading && nomesDasRacas.length > 0 ? (
                        nomesDasRacas.map((nome) => (
                            <Card key={nome} sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                                <CardMedia sx={{ height: 140 }} image={`/images/races/${nome}.jpg`} title={nome} />
                                <CardContent className='text-center flex-grow'>
                                    <Typography variant='h5' component="div" className='capitalize'>{nome}</Typography>
                                    <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                                    <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                        {Object.entries(races[nome].bonus)
                                            .filter(([_, valor]) => valor !== 0)
                                            .map(([atributo, valor]) => (
                                                <Typography key={atributo} variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
                                                    <span className='capitalize'>{atributo}:</span>
                                                    <span style={{ color: valor > 0 ? 'green' : 'red', marginLeft: '4px', fontWeight: 'bold' }}>
                                                        {valor > 0 ? `+${valor}` : valor}
                                                    </span>
                                                </Typography>
                                            ))}
                                    </Box>
                                </CardContent>
                                <Box className='flex justify-end gap-2 p-2'>
                                    <Button size="small" onClick={() => handleOpenEdit(nome)}><Edit /></Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(nome)}><Delete /></Button>
                                </Box>
                            </Card>
                        ))
                    ) : (
                        !isLoading && <p>Nenhuma raça encontrada.</p>
                    )}
                </div>
            </div>

            <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveRace(); } }}>
                <DialogTitle>{editingRaceName ? 'Editar Raça' : 'Adicionar Nova Raça'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {editingRaceName ? `Modifique as informações da raça ${editingRaceName}.` : 'Preencha as informações da nova raça.'}
                    </DialogContentText>
                    <TextField
                        autoFocus required margin="dense" id="name" name="nome"
                        label="Nome da Raça" type="text" fullWidth variant="standard"
                        value={formData.nome} onChange={handleFormChange}
                    />
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {Object.keys(formData.bonus).map(bonusKey => (
                            <TextField
                                key={bonusKey} margin="dense" id={bonusKey} name={bonusKey}
                                label={bonusKey.charAt(0).toUpperCase() + bonusKey.slice(1)}
                                type="number" variant="standard"
                                value={formData.bonus[bonusKey]} onChange={handleFormChange}
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </>
    )
}

export default Races;