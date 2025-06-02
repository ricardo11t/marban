import React, { useContext, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ClassesContext } from '../context/ClassesProvider';
import {
    Card, CardContent, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress,
    Autocomplete
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

// Necessário para os labels dos campos de bônus no formulário
const bonusFieldsForAttributeOptions = {
    forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
    agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
};
const attributeKeys = Object.keys(bonusFieldsForAttributeOptions);
const attributeOptions = attributeKeys.map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}));
// Fim da seção para labels de bônus

// Opções para o novo campo Tipo de Classe
const tiposDeClasseOptions = [
    { value: 'fisico', label: 'Físico' },
    { value: 'magico', label: 'Mágico' },
    { value: 'neutro', label: 'Neutro' },
];

const initialFormState = {
    nome: '',
    bonus: {
        forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
        agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
    },
    tipo: { tipoClasse: null } // ESTRUTURA SIMPLIFICADA AQUI
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
    '& .MuiFilledInput-input': {
        color: 'white',
        '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 1000px #601b1c inset !important', WebkitTextFillColor: 'white !important', caretColor: 'white !important' },
    },
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
        const classeData = classes[nome];
        if (classeData) {
            setFormData({
                nome,
                bonus: { ...initialFormState.bonus, ...(classeData.bonus || {}) },
                tipo: { tipoClasse: classeData.tipo?.tipoClasse || null } // Carregando tipoClasse
            });
        } else {
            console.error(`Classe ${nome} não encontrada.`);
            setFormData(initialFormState);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFormChange = (event, value, fieldName) => {
        if (fieldName === 'tipoClasseSelection') { // Identificador para o Autocomplete de tipoClasse
            setFormData(prev => ({
                ...prev,
                tipo: { ...prev.tipo, tipoClasse: value ? value.value : null }
            }));
        } else {
            const { name, value: inputValue } = event.target;
            const isBonusField = Object.keys(initialFormState.bonus).includes(name);

            if (name === 'nome') {
                setFormData(prev => ({ ...prev, nome: inputValue }));
            } else if (isBonusField) {
                setFormData(prev => ({
                    ...prev,
                    bonus: { ...prev.bonus, [name]: Number(inputValue) || 0 }
                }));
            }
        }
    };

    const handleSaveClasse = async () => {
        setIsLoading(true);
        try {
            const classDataToSave = {
                name: editingClassName ? formData.nome : formData.nome.toLowerCase(),
                bonus: formData.bonus,
                tipo: formData.tipo // Salva o objeto tipo { tipoClasse: '...' }
            };

            if (!classDataToSave.name.trim()) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da classe não pode ser vazio.' });
                setIsLoading(false);
                return;
            }
            // Validação do tipo de classe (opcional, mas bom ter)
            if (!classDataToSave.tipo?.tipoClasse) {
                Swal.fire({ icon: 'warning', title: 'Atenção!', text: 'O tipo da classe não foi selecionado. Deseja continuar?', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não' }).then(async (result) => {
                    if (result.isConfirmed) {
                        await proceedWithSave(classDataToSave);
                    } else {
                        setIsLoading(false);
                        return;
                    }
                });
            } else {
                await proceedWithSave(classDataToSave);
            }


        } catch (error) { // Erro pego pelo proceedWithSave
            console.error("Erro ao salvar classe:", error);
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Algo deu errado ao salvar a classe!', footer: `Erro: ${error.message}` });
            setIsLoading(false); // Garantir que o loading seja desativado em caso de erro antes do fetch
        }
        // O finally do proceedWithSave cuidará do setIsLoading(false) em caso de sucesso ou erro no fetch.
    };

    const proceedWithSave = async (classDataToSave) => {
        // setIsLoading(true); // Já definido em handleSaveClasse
        try {
            await fetch('/api/classes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(classDataToSave)
            });

            await refetchClasses();
            handleClose();

            Swal.fire({
                icon: 'success', title: 'Salvo!', text: `A classe "${classDataToSave.name}" foi salva com sucesso.`,
                showConfirmButton: false, timer: 1500
            });
        } catch (error) {
            // Re-throw para ser pego pelo catch de handleSaveClasse ou logar aqui
            console.error("Erro no proceedWithSave:", error);
            // O Swal de erro já está no handleSaveClasse, mas podemos ter um específico aqui se necessário
            throw error; // Propaga o erro para o catch de handleSaveClasse
        } finally {
            setIsLoading(false);
        }
    };


    const handleDelete = (classNameToDelete) => {
        Swal.fire({
            title: 'Tem certeza?', text: `Você não poderá reverter a exclusão da classe "${classNameToDelete}"!`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!', cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/classes?name=${encodeURIComponent(classNameToDelete)}`, { method: 'DELETE' });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }
                    await refetchClasses();
                    Swal.fire('Deletado!', `A classe "${classNameToDelete}" foi deletada.`, 'success');
                } catch (error) {
                    console.error("Erro ao deletar classe:", error);
                    Swal.fire({ icon: 'error', title: 'Oops...', text: 'Algo deu errado ao deletar a classe!', footer: `Erro: ${error.message}` });
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
                        nomesDasClasses.map((id) => {
                            const classeAtual = classes[id];
                            if (!classeAtual) return null;

                            const tipoClasseLabel = classeAtual.tipo?.tipoClasse
                                ? tiposDeClasseOptions.find(opt => opt.value === classeAtual.tipo.tipoClasse)?.label || classeAtual.tipo.tipoClasse
                                : 'N/A';

                            return (
                                <Card key={id} sx={{ backgroundColor: '#601b1c', color: 'white', width: 320, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent className='text-center flex-grow'>
                                        <Typography variant='h5' component="div" sx={{ color: 'white' }} className='capitalize'>{id.name}</Typography>
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
                                        {/* Exibição do Tipo de Classe no Card */}
                                        {classeAtual.tipo?.tipoClasse && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ color: 'white', mt: 2, mb: 1, fontWeight: 'bold' }}>Tipo da Classe:</Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{tipoClasseLabel}</Typography>
                                            </>
                                        )}
                                    </CardContent>
                                    <Box className='flex justify-end gap-2 p-2 mt-auto'>
                                        <Button size="small" onClick={() => handleOpenEdit(id)} sx={{ color: 'white' }}><Edit /></Button>
                                        <Button size="small" onClick={() => handleDelete(id)} sx={{ color: 'lightcoral' }}><Delete /></Button>
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
                    sx: { backgroundColor: 'black', color: 'white', minWidth: '400px' }
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
                        autoFocus required margin="dense" id="name" name="nome" label="Nome da Classe" type="text" fullWidth
                        variant="filled" value={formData.nome} onChange={handleFormChange} disabled={!!editingClassName} sx={filledTextFieldStyles}
                    />
                    <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Bônus da Classe:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        {Object.keys(formData.bonus).map(bonusKey => (
                            <TextField
                                key={bonusKey} margin="dense" id={bonusKey} name={bonusKey}
                                label={attributeOptions.find(opt => opt.value === bonusKey)?.label || bonusKey} // Usando attributeOptions para label
                                type="number" variant="filled" value={formData.bonus[bonusKey]}
                                onChange={handleFormChange} sx={filledTextFieldStyles}
                            />
                        ))}
                    </Box>

                    {/* Novo Campo para Tipo de Classe */}
                    <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                        Tipo da Classe:
                    </Typography>
                    <Autocomplete
                        id="tipoClasseSelection"
                        options={tiposDeClasseOptions}
                        getOptionLabel={(option) => option.label || ""}
                        value={tiposDeClasseOptions.find(opt => opt.value === formData.tipo.tipoClasse) || null}
                        onChange={(event, newValue) => {
                            handleFormChange(event, newValue, 'tipoClasseSelection');
                        }}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Selecione o Tipo"
                                variant="filled"
                                margin="dense"
                                sx={filledTextFieldStyles}
                            />
                        )}
                        PaperComponentProps={{
                            sx: { backgroundColor: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }
                        }}
                        sx={{
                            '& .MuiAutocomplete-option': {
                                color: 'white',
                                '&[aria-selected="true"]': { backgroundColor: 'rgba(255, 255, 255, 0.2) !important' },
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1) !important' },
                            },
                            '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ pt: 2, pb: 2, pr: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} variant="contained" sx={{
                        backgroundColor: '#007bff', color: 'white',
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