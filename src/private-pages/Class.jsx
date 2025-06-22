import React, { useContext, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ClassesContext } from '../context/ClassesProvider';
import { AuthContext } from '../context/AuthProvider'; // Import AuthContext
import {
    Card, CardContent, Typography, Box, Button,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress,
    Autocomplete
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

// --- Constantes de Configuração (Mantidas como no seu código) ---

const bonusFieldsForAttributeOptions = {
    forca: 0, resFisica: 0, resMental: 0, manipulacao: 0, resMagica: 0, sobrevivencia: 0,
    agilidade: 0, destreza: 0, competencia: 0, criatividade: 0, sorte: 0
};
const attributeKeys = Object.keys(bonusFieldsForAttributeOptions);

const attributeOptions = attributeKeys.map(key => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}));

const tiposDeClasseOptions = [
    { value: 'fisico', label: 'Físico' },
    { value: 'magico', label: 'Mágico' },
    { value: 'neutro', label: 'Neutro' },
];

const initialFormState = {
    nome: '',
    bonus: { ...bonusFieldsForAttributeOptions },
    tipo: { tipoClasse: null }
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
    const { classes, isLoading: isLoadingClasses, error: classesError, refetchClasses } = useContext(ClassesContext);
    // Destructure axiosInstance from AuthContext
    const { isAdmin, axiosInstance } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingClassName, setEditingClassName] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormState);
            setEditingClassName(null);
        }
    }, [open]);

    const handleOpenAdd = () => {
        setEditingClassName(null);
        setFormData(initialFormState);
        setOpen(true);
    };

    const handleOpenEdit = (classeObject) => {
        if (!classeObject || typeof classeObject.name === 'undefined') {
            Swal.fire('Erro', 'Dados da classe inválidos para edição.', 'error');
            return;
        }
        console.log('Objeto da classe selecionada: ', classeObject);
        const currentClassName = classeObject.name;

        setEditingClassName(currentClassName);
        setFormData({
            nome: currentClassName,
            bonus: { ...initialFormState.bonus, ...(classeObject.bonus || {}) },
            tipo: { tipoClasse: classeObject.tipo?.tipoClasse || null }
        });
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleFormChange = (event, value, fieldName) => {
        if (fieldName === 'tipoClasseSelection') {
            setFormData(prev => ({ ...prev, tipo: { ...prev.tipo, tipoClasse: value ? value.value : null } }));
        } else {
            const { name, value: inputValue } = event.target;
            const isBonusField = Object.keys(initialFormState.bonus).includes(name);
            const isTipoField = Object.keys(initialFormState.tipo).includes(name);
            console.log(isBonusField);
            console.log(isTipoField);
            if (name === 'nome') {
                setFormData(prev => ({ ...prev, nome: inputValue }));
            } else if (isBonusField) {
                setFormData(prev => ({ ...prev, bonus: { ...prev.bonus, [name]: Number(inputValue) || 0 } }));
            } else if (isTipoField) {
                setFormData(prev => ({...prev, tipo: {tipoClasse: inputValue}}));
            }
        }
    };

    const handleSaveClasse = async () => {
        // No need for manual token check here, axios interceptor handles it
        if (!isAdmin()) { // Still check if user has permission to perform the action
            Swal.fire('Erro de Permissão', 'Você não tem permissão para realizar esta ação.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Montamos o payload no novo formato, com 'classData' aninhado.
            const classPayload = {
                name: formData.nome.trim(), // O nome da classe vai no campo 'nome'
                classData: {               // 'bonus' e 'tipo' vão dentro de 'classData'
                    bonus: formData.bonus,
                    tipo: formData.tipo
                }
            };

            if (!classPayload.name) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da classe não pode ser vazio.' });
                setIsSubmitting(false);
                return;
            }

            let url = `/classes`; // Use relative path for axios instance
            let method = 'post'; // axios method name is lowercase
            let requestBody = classPayload; // Default body for POST

            if (editingClassName) {
                url = `/classes/${encodeURIComponent(editingClassName)}?name=${encodeURIComponent(editingClassName)}`;
                method = 'put';
                requestBody = classPayload.classData;
            }

            // Use axiosInstance for the request
            const response = await axiosInstance[method](url, requestBody);

            await refetchClasses();
            handleClose();
            Swal.fire({
                icon: 'success', title: editingClassName ? 'Atualizado!' : 'Criado!',
                text: `A classe "${classPayload.name}" foi salva com sucesso.`, // Use classPayload.name
                showConfirmButton: false, timer: 1500
            });

        } catch (error) {
            // The 401/403 errors are handled by the interceptor and will lead to a redirect.
            // Other errors (e.g., 400 Bad Request, 500 Internal Server Error) will reach here.
            console.error("Erro ao salvar classe:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Algo deu errado ao salvar a classe!';
            Swal.fire({ icon: 'error', title: 'Oops...', text: errorMessage, footer: `Erro: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (classNameString) => {
        if (!isAdmin()) {
            Swal.fire('Erro de Permissão', 'Você não tem permissão para realizar esta ação.', 'error');
            return;
        }

        Swal.fire({
            title: `Deletar ${classNameString}?`,
            text: `Você não poderá reverter a exclusão da classe "${classNameString}"!`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!', cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true);
                try {
                    // Use axiosInstance for the DELETE request
                    await axiosInstance.delete(`/classes/${encodeURIComponent(classNameString)}`);

                    await refetchClasses();
                    Swal.fire('Deletado!', `A classe "${classNameString}" foi deletada.`, 'success');
                } catch (error) {
                    console.error("Erro ao deletar classe:", error);
                    const errorMessage = error.response?.data?.message || error.message || 'Algo deu errado ao deletar a classe!';
                    Swal.fire({ icon: 'error', title: 'Oops...', text: errorMessage, footer: `Erro: ${error.message}` });
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    // --- Renderização do Componente ---
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-8">
                    <Typography variant='h3' component="h1" className='font-bold text-center mb-10'>Classes</Typography>

                    <div className='flex justify-start mb-6 max-[450px]:justify-center'>
                        {isAdmin() && (
                            <Button variant="contained" onClick={handleOpenAdd} sx={{ backgroundColor: '#601b1c', '&:hover': { backgroundColor: '#501b1c' } }}>
                                Adicionar Classe
                            </Button>
                        )}
                    </div>

                    <div className='flex flex-wrap justify-center gap-6 mb-10'>
                        {isLoadingClasses && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}><CircularProgress sx={{ color: '#601b1c' }} size={60} /></Box>}
                        {classesError && <Typography color="error" className="w-full text-center">Erro ao carregar classes: {classesError}</Typography>}

                        {!isLoadingClasses && !classesError && classes && classes.length > 0 ? (
                            classes.map((classeItem) => {
                                const classNameKey = classeItem.name;

                                if (!classNameKey) {
                                    console.warn("Item de classe inválido no array:", classeItem);
                                    return null;
                                }

                                const tipoClasseLabel = classeItem.tipo?.tipoClasse
                                    ? tiposDeClasseOptions.find(opt => opt.value === classeItem.tipo.tipoClasse)?.label || classeItem.tipo.tipoClasse
                                    : 'N/A';

                                return (
                                    <Card key={classNameKey} sx={{ backgroundColor: '#601b1c', color: 'white', width: 320, display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                                        <CardContent className='text-center flex-grow'>
                                            <Typography variant='h5' component="div" sx={{ color: 'white', mb: 2 }} className='capitalize'>{classNameKey}</Typography>

                                            {/* Exibição de Bônus */}
                                            {classeItem.bonus && Object.values(classeItem.bonus).some(v => v !== 0) && (
                                                <>
                                                    <Typography variant='subtitle1' sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>
                                                        Bônus da Classe:
                                                    </Typography>
                                                    <Box className='grid grid-cols-2 gap-x-4 gap-y-1 px-2'>
                                                        {Object.entries(classeItem.bonus)
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
                                            {/* Exibição do Tipo */}
                                            {classeItem.tipo?.tipoClasse && (
                                                <>
                                                    <Typography variant='subtitle1' sx={{ color: 'rgba(255,255,255,0.9)', mt: 2, mb: 1, fontWeight: 'bold' }}>Tipo da Classe:</Typography>
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{tipoClasseLabel}</Typography>
                                                </>
                                            )}
                                        </CardContent>
                                        {isAdmin() && (
                                            <>
                                                <Box className='flex justify-end gap-1 p-2 mt-auto border-t border-gray-700'>
                                                    <Button size="small" onClick={() => handleOpenEdit(classeItem)} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}><Edit fontSize="small" /></Button>
                                                    <Button size="small" onClick={() => handleDelete(classNameKey)} sx={{ color: 'lightcoral', '&:hover': { backgroundColor: 'rgba(255,100,100,0.1)' } }}><Delete fontSize="small" /></Button>
                                                </Box>
                                            </>
                                        )}
                                    </Card>
                                );
                            })
                        ) : (
                            !isLoadingClasses && !classesError && <Typography className='w-full text-center'>Nenhuma classe encontrada.</Typography>
                        )}
                    </div>
                </div>

                {/* --- Formulário de Diálogo --- */}
                <Dialog open={open} onClose={handleClose} PaperProps={{
                    component: 'form',
                    onSubmit: (e) => { e.preventDefault(); handleSaveClasse(); },
                    sx: { backgroundColor: 'black', color: 'white', minWidth: { xs: '90%', sm: '400px', md: '500px' }, borderRadius: 2 }
                }}>
                    <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {editingClassName ? `Editar Classe: ${editingClassName}` : 'Adicionar Nova Classe'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: '20px !important' }}>
                        <TextField
                            autoFocus={!editingClassName}
                            required margin="dense" id="classname" name="nome" label="Nome da Classe" type="text"
                            fullWidth variant="filled" value={formData.nome} onChange={handleFormChange}
                            disabled={!!editingClassName}
                            sx={filledTextFieldStyles}
                        />
                        <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                            Bônus da Classe:
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                            {Object.keys(formData.bonus).map(bonusKey => (
                                <TextField
                                    key={bonusKey} margin="dense" id={bonusKey} name={bonusKey}
                                    label={attributeOptions.find(opt => opt.value === bonusKey)?.label || bonusKey}
                                    type="number" variant="filled" value={formData.bonus[bonusKey]}
                                    onChange={handleFormChange} sx={filledTextFieldStyles}
                                />
                            ))}
                        </Box>
                        <Typography variant='subtitle1' sx={{ color: 'white', mt: 3, mb: 1, fontWeight: 'bold' }}>
                            Tipo da Classe:
                        </Typography>
                        <Autocomplete
                            id="tipoClasseSelection"
                            options={tiposDeClasseOptions}
                            getOptionLabel={(option) => option.label || ""}
                            value={tiposDeClasseOptions.find(opt => opt.value === formData.tipo.tipoClasse) || null}
                            onChange={(event, newValue) => handleFormChange(event, newValue, 'tipoClasseSelection')}
                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                            renderInput={(params) => (
                                <TextField {...params} label="Selecione o Tipo" variant="filled" margin="dense" sx={filledTextFieldStyles} />
                            )}
                            PaperComponentProps={{ sx: { backgroundColor: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.2)' } }}
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
                    <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} variant="contained" sx={{
                            backgroundColor: '#007bff', color: 'white',
                            '&:hover': { backgroundColor: '#0056b3' },
                            '&.Mui-disabled': { backgroundColor: 'rgba(0, 123, 255, 0.3)', color: 'rgba(255,255,255,0.5)' }
                        }}>
                            {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (editingClassName ? 'Salvar Alterações' : 'Criar Classe')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            <Footer />
        </>
    );
};

export default Classes;