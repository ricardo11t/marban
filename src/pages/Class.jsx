import React, { useContext, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ClassesContext } from '../context/ClassesProvider';
import {
    Card, CardContent, CardMedia, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
    }
};

const Classes = () => {
    // CORRIGIDO: refetchclasses -> refetchClasses
    const { classes, refetchClasses } = useContext(ClassesContext);
    const nomesDasClasses = Object.keys(classes || {});

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    // CORRIGIDO: editingclassName -> editingClassName (evitar palavra reservada)
    const [editingClassName, setEditingClassName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenAdd = () => {
        setEditingClassName(null);
        setFormData(initialFormState);
        setOpen(true);
    };

    const handleOpenEdit = (nome) => {
        setEditingClassName(nome);
        setFormData({ nome, bonus: classes[nome].bonus });
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

    // --- FUNÇÕES CRUD CORRIGIDAS ---

    // CORRIGIDO: handleSaveclass -> handleSaveClasse
    const handleSaveClasse = async () => {
        setIsLoading(true);
        try {
            // CORRIGIDO: Endpoint /classes
            const currentClasses = await (await fetch('/api/classes')).json();
            const newClasses = { ...currentClasses };

            if (editingClassName && editingClassName !== formData.nome) {
                delete newClasses[editingClassName];
            }

            newClasses[formData.nome.toLowerCase()] = { bonus: formData.bonus };

            // CORRIGIDO: Endpoint /classes
            await fetch('/api/classes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClasses)
            });

            await refetchClasses();
            handleClose();

            // CORRIGIDO: Texto do Alerta
            Swal.fire({
                icon: 'success',
                title: 'Salvo!',
                text: 'A classe foi salva com sucesso.',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error("Erro ao salvar classe:", error);
            // CORRIGIDO: Texto do Alerta
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Algo deu errado ao salvar a classe!',
                footer: `Erro: ${error.message}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    // CORRIGIDO: Parâmetro className -> classNameToDelete
    const handleDelete = (classNameToDelete) => {
        Swal.fire({
            title: 'Tem certeza?',
            // CORRIGIDO: Texto do Alerta
            text: `Você não poderá reverter a exclusão da classe "${classNameToDelete}"!`,
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
                    // CORRIGIDO: Endpoint /classes
                    const currentClasses = await (await fetch('/api/classes')).json();
                    delete currentClasses[classNameToDelete];

                    // CORRIGIDO: Endpoint /classes
                    await fetch('/api/classes', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentClasses)
                    });

                    await refetchClasses();

                    // CORRIGIDO: Texto do Alerta
                    Swal.fire(
                        'Deletado!',
                        `A classe "${classNameToDelete}" foi deletada.`,
                        'success'
                    );

                } catch (error) {
                    console.error("Erro ao deletar classe:", error);
                    // CORRIGIDO: Texto do Alerta
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Algo deu errado ao deletar a classe!',
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
                {/* CORRIGIDO: Título da página */}
                <div><h1 className='text-5xl font-bold text-center mt-10 mb-10'>Classes</h1></div>
                <div className='flex justify-start ml-10 mb-4'>
                    {/* CORRIGIDO: Texto do Botão */}
                    <Button variant='contained' sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: '#b91c1c' } }} onClick={handleOpenAdd}>
                        Adicionar nova Classe
                    </Button>
                </div>
                <div className='flex flex-wrap justify-center gap-6 mb-10'>
                    {isLoading && <CircularProgress />}
                    {/* CORRIGIDO: nomesDasRacas -> nomesDasClasses */}
                    {!isLoading && nomesDasClasses.length > 0 ? (
                        nomesDasClasses.map((nome) => (
                            <Card key={nome} sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                                <CardMedia sx={{ height: 140 }} image={`/images/classes/${nome}.jpg`} title={nome} />
                                <CardContent className='text-center flex-grow'>
                                    <Typography variant='h5' component="div" className='capitalize'>{nome}</Typography>
                                    {/* CORRIGIDO: Texto */}
                                    <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Classe:</Typography>
                                    <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                        {Object.entries(classes[nome].bonus)
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
                        // CORRIGIDO: Texto
                        !isLoading && <p>Nenhuma classe encontrada.</p>
                    )}
                </div>
            </div>

            {/* CORRIGIDO: onSubmit e textos do Dialog */}
            <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveClasse(); } }}>
                <DialogTitle>{editingClassName ? 'Editar Classe' : 'Adicionar Nova Classe'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {editingClassName ? `Modifique as informações da classe ${editingClassName}.` : 'Preencha as informações da nova classe.'}
                    </DialogContentText>
                    <TextField
                        autoFocus required margin="dense" id="name" name="nome"
                        label="Nome da Classe" type="text" fullWidth variant="standard"
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

export default Classes;