import React, { useContext, useState } from 'react';
import Header from '.../components/Header';
import Footer from '.../components/Footer';
import { ClassesContext } from '.../context/ClassesProvider'; // Certifique-se que o caminho está correto
import {
    Card, CardContent, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
    }
};

// Reutilizando os estilos definidos anteriormente para os TextFields
const filledTextFieldStyles = {
    '& .MuiFilledInput-root': {
        backgroundColor: '#601b1c',
        color: 'white',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        '&:hover': {
            backgroundColor: '#752d2e',
        },
        '&.Mui-focused': {
            backgroundColor: '#601b1c',
        },
        '&:before': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '&:after': {
            borderBottom: '2px solid white',
        },
        '&.Mui-disabled': {
            backgroundColor: 'rgba(96, 27, 28, 0.5)',
            color: 'rgba(255, 255, 255, 0.5)',
        }
    },
    '& .MuiFilledInput-input': {
        color: 'white',
        '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #601b1c inset !important',
            WebkitTextFillColor: 'white !important',
            caretColor: 'white !important',
        },
    },
    '& label.MuiInputLabel-filled': {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    '& label.MuiInputLabel-filled.Mui-focused': {
        color: 'white',
    },
    '& label.MuiInputLabel-filled.Mui-disabled': {
        color: 'rgba(255, 255, 255, 0.4)',
    }
};

// Labels mais amigáveis para os atributos de bônus
const attributeLabels = {
    forca: "Força",
    resFisica: "Res. Física",
    resMental: "Res. Mental",
    manipulacao: "Manipulação",
    resMagica: "Res. Mágica",
    sobrevivencia: "Sobrevivência",
    agilidade: "Agilidade",
    destreza: "Destreza",
    competencia: "Competência",
    criatividade: "Criatividade",
    sorte: "Sorte"
};


const Classes = () => {
    const { classes, refetchClasses } = useContext(ClassesContext);
    const nomesDasClasses = Object.keys(classes || {});

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingClassName, setEditingClassName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenAdd = () => {
        setEditingClassName(null);
        setFormData(initialFormState);
        setOpen(true);
    };

    const handleOpenEdit = (nome) => {
        setEditingClassName(nome);
        if (classes[nome]) {
            setFormData({ nome, bonus: { ...initialFormState.bonus, ...classes[nome].bonus } }); // Mescla para garantir todos os campos
        } else {
            console.error(`Classe ${nome} não encontrada nos dados do contexto.`);
            setFormData(initialFormState);
        }
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

    const handleSaveClasse = async () => {
        setIsLoading(true);
        try {
            const classDataToSave = {
                name: formData.nome,
                bonus: formData.bonus
            };

            if (!classDataToSave.name.trim()) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da classe não pode ser vazio.' });
                setIsLoading(false);
                return;
            }

            await fetch('/api/classes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(classDataToSave)
            });

            await refetchClasses();
            handleClose();

            Swal.fire({
                icon: 'success',
                title: 'Salvo!',
                text: `A classe "${classDataToSave.name}" foi salva com sucesso.`,
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error("Erro ao salvar classe:", error);
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

    const handleDelete = (classNameToDelete) => {
        Swal.fire({
            title: 'Tem certeza?',
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
                    const response = await fetch(`/api/classes?name=${encodeURIComponent(classNameToDelete)}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }

                    await refetchClasses();

                    Swal.fire(
                        'Deletado!',
                        `A classe "${classNameToDelete}" foi deletada.`,
                        'success'
                    );

                } catch (error) {
                    console.error("Erro ao deletar classe:", error);
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
                <div><h1 className='text-5xl font-bold text-white text-center mt-10 mb-10'>Classes</h1></div>
                <div className='flex justify-start ml-10 mb-4'>
                    <Button variant='contained' sx={{ backgroundColor: '#601b1c', '&:hover': { backgroundColor: '#b91c1c' } }} onClick={handleOpenAdd}>
                        Adicionar nova Classe
                    </Button>
                </div>
                <div className='flex flex-wrap justify-center gap-6 mb-10'>
                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress sx={{ color: '#601b1c' }} /></Box>}
                    {!isLoading && nomesDasClasses.length > 0 ? (
                        nomesDasClasses.map((nome) => {
                            const classeAtual = classes[nome]; // Para facilitar o acesso
                            if (!classeAtual) return null;

                            return (
                                <Card key={nome} sx={{ backgroundColor: '#601b1c', color: 'white', width: 320, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent className='text-center flex-grow'>
                                        <Typography variant='h5' component="div" className='capitalize sx={{color: "white"}}'>{nome}</Typography>

                                        {classeAtual.bonus && Object.values(classeAtual.bonus).some(v => v !== 0) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'white' }}>
                                                    Bônus da Classe:
                                                </Typography>
                                                <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                                    {Object.entries(classeAtual.bonus)
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
                                    </CardContent>
                                    <Box className='flex justify-end gap-2 p-2 mt-auto'> {/* mt-auto para empurrar para baixo */}
                                        <Button size="small" onClick={() => handleOpenEdit(nome)} sx={{ color: 'white' }}><Edit /></Button>
                                        <Button size="small" onClick={() => handleDelete(nome)} sx={{ color: 'lightcoral' }}><Delete /></Button>
                                    </Box>
                                </Card>
                            );
                        })
                    ) : (
                        !isLoading && <p className='text-white'>Nenhuma classe encontrada.</p>
                    )}
                </div>
            </div>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (e) => { e.preventDefault(); handleSaveClasse(); },
                    sx: {
                        backgroundColor: 'black',
                        color: 'white',
                        minWidth: '400px',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {editingClassName ? 'Editar Classe' : 'Adicionar Nova Classe'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, mt: 1 }}>
                        {editingClassName ? `Modifique as informações da classe ${editingClassName}.` : 'Preencha as informações da nova classe.'}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="nome"
                        label="Nome da Classe"
                        type="text"
                        fullWidth
                        variant="filled" // Alterado para "filled"
                        value={formData.nome}
                        onChange={handleFormChange}
                        disabled={!!editingClassName}
                        sx={filledTextFieldStyles} // Aplicando estilos
                    />
                    <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Bônus da Classe:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        {Object.keys(formData.bonus).map(bonusKey => (
                            <TextField
                                key={bonusKey}
                                margin="dense"
                                id={bonusKey}
                                name={bonusKey}
                                label={attributeLabels[bonusKey] || bonusKey.charAt(0).toUpperCase() + bonusKey.slice(1)} // Usando labels amigáveis
                                type="number"
                                variant="filled" // Alterado para "filled"
                                value={formData.bonus[bonusKey]}
                                onChange={handleFormChange}
                                sx={filledTextFieldStyles} // Aplicando estilos
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 2, pb: 2, pr: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} variant="contained" sx={{
                        backgroundColor: '#007bff',
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

export default Classes;