import React, { useContext, useState, useEffect } from 'react'; // Adicionado useEffect
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RacesContext } from '../context/RacesProvider';
import { /* ...seus imports do MUI ... */ } from '@mui/material';
// ... (initialFormState, attributeOptions, filledTextFieldStyles, etc.) ...

const Races = () => {
    // Agora races é um array, isLoading e error também vêm do contexto
    const { races, isLoading: isLoadingRaces, error: racesError, refetchRaces } = useContext(RacesContext);

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingRaceName, setEditingRaceName] = useState(null); // Nome da raça (string) que está sendo editada
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading para o dialog/save

    // Limpar o formulário quando o dialog fecha ou abre para adicionar
    useEffect(() => {
        if (!open) {
            setFormData(initialFormState);
            setEditingRaceName(null);
        }
    }, [open]);

    const handleOpenAdd = () => {
        setEditingRaceName(null); // Garante que não estamos no modo de edição
        setFormData(initialFormState); // Limpa o formulário
        setOpen(true);
    };

    const handleOpenEdit = (raceObject) => {
        // raceObject é o item do array: { name: { name: "humano" }, bonus: {...}, pdd: {...} }
        if (!raceObject || !raceObject.name || typeof raceObject.name.name === 'undefined') {
            console.error("Tentou editar uma raça com dados inválidos:", raceObject);
            Swal.fire('Erro', 'Não foi possível carregar os dados desta raça para edição.', 'error');
            return;
        }
        const currentRaceName = raceObject.name.name;
        setEditingRaceName(currentRaceName);
        setFormData({
            nome: currentRaceName, // 'nome' no formulário recebe o nome da raça
            bonus: { ...(raceObject.bonus || initialFormState.bonus) },
            pdd: { ...(raceObject.pdd || initialFormState.pdd) }
        });
        setOpen(true);
    };

    // handleClose, handleFormChange, getAutocompleteValue permanecem os mesmos
    const handleClose = () => {
        setOpen(false);
    };

    const handleFormChange = (event, value, fieldName) => {
        // ... (seu código handleFormChange existente) ...
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

    const getAutocompleteValue = (attributeValue) => {
        if (!attributeValue) return null;
        return attributeOptions.find(option => option.value === attributeValue) || null;
    };


    const handleSaveRace = async () => {
        setIsSubmitting(true); // Usar isSubmitting para o loading do dialog
        try {
            const raceDataToSave = {
                // O nome da raça para a API deve ser o 'nome' do formulário.
                // Se estiver editando, o nome original é editingRaceName.
                // Se for um novo, é formData.nome.
                // Sua API de PUT /api/races espera o nome no corpo.
                name: formData.nome.toLowerCase().trim(), // Normaliza o nome para salvar
                bonus: formData.bonus,
                pdd: formData.pdd
            };

            if (!raceDataToSave.name) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'O nome da raça não pode ser vazio.' });
                setIsSubmitting(false);
                return;
            }

            // ... (sua validação de PdD existente) ...
            if ((formData.pdd.PdDFixo > 0 || formData.pdd.PdDFração > 0) && !formData.pdd.AtributoUtilizado) {
                Swal.fire({ icon: 'error', title: 'Erro!', text: 'Se PdD Fixo ou Fração for maior que zero, o Atributo Utilizado para PdD deve ser selecionado.' });
                setIsSubmitting(false);
                return;
            }

            // A API de PUT espera o nome no corpo, não como query param para identificar
            // Se a sua API de PUT realmente espera o nome antigo como query param para identificar
            // e o novo nome (se mudou) e dados no corpo, ajuste o fetch.
            // Assumindo que o nome é a chave e não pode ser mudado via PUT (ou a API lida com isso):
            let url = '/api/races';
            let method = 'POST'; // Assume criação por padrão

            if (editingRaceName) { // Se estiver editando
                // Se sua API de PUT precisa do nome antigo na URL e o novo no corpo:
                // url = `/api/races?name=${encodeURIComponent(editingRaceName)}`;
                // Ou se o nome é imutável e a API de PUT usa o nome do corpo para encontrar:
                method = 'PUT';
                // Se o nome pode ser alterado, você precisa de um identificador estável (ID) ou lidar
                // com a renomeação no backend. Por simplicidade, vamos assumir que o nome é a chave.
                // A API precisa saber qual raça atualizar. Se o nome é a chave primária e pode ser editado,
                // você geralmente passa o NOME ANTIGO para identificar e os NOVOS DADOS no corpo.
                // Sua API de PUT (PUT /api/races) no handler 'races.js' usa req.query.name para identificar.
                // E o controller usa req.body para os novos dados.
                // Então, se o nome PODE ser editado, precisamos passar o nome antigo na query.
                // Se o nome NÃO PODE ser editado, formData.nome == editingRaceName.
                url = `/api/races?name=${encodeURIComponent(editingRaceName)}`;
                // E os dados no body são os novos dados. Se o nome foi editado no form, raceDataToSave.name será o novo nome.
            }


            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(raceDataToSave) // Envia todos os dados, incluindo o nome (novo ou o mesmo)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Tenta pegar JSON, senão objeto vazio
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            await refetchRaces();
            handleClose();

            Swal.fire({
                icon: 'success',
                title: editingRaceName ? 'Atualizado!' : 'Criado!',
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
                footer: `Erro: ${error.message || 'Verifique o console para mais detalhes.'}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (raceNameString) => { // raceNameString é o nome como "humano"
        // ... (seu código handleDelete existente, ele já recebe o nome como string) ...
        Swal.fire({ /* ... */ }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true); // Reutilizar isSubmitting para feedback de loading
                try {
                    const response = await fetch(`/api/races?name=${encodeURIComponent(raceNameString)}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                    }
                    await refetchRaces();
                    Swal.fire('Deletado!', `A raça "${raceNameString}" foi deletada.`, 'success');
                } catch (error) {
                    // ... seu tratamento de erro ...
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
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
                    {/* Usa isLoadingRaces do contexto para a lista principal */}
                    {isLoadingRaces && <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress sx={{ color: '#601b1c' }} /></Box>}
                    {racesError && <p className='text-red-500'>Erro ao carregar raças: {racesError}</p>}

                    {!isLoadingRaces && !racesError && races && races.length > 0 ? (
                        races.map((raceItem) => { // Itera sobre o ARRAY 'races'
                            // Verifica se a estrutura é válida antes de tentar acessar
                            if (!raceItem || !raceItem.name || typeof raceItem.name.name === 'undefined') {
                                console.warn("Item de raça inválido no array:", raceItem);
                                return null; // Pula este item
                            }
                            const raceNameKey = raceItem.name.name; // O nome real da raça

                            // A lógica para atributoUtilizadoLabel pode precisar ser ajustada se raceItem.pdd não existir
                            const atributoUtilizadoLabel = raceItem.pdd?.AtributoUtilizado
                                ? (attributeOptions.find(opt => opt.value === raceItem.pdd.AtributoUtilizado)?.label || raceItem.pdd.AtributoUtilizado)
                                : 'N/A';

                            return (
                                <Card key={raceNameKey} sx={{ backgroundColor: '#601b1c', width: 320, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent className='text-center flex-grow'>
                                        <Typography variant='h5' component="div" sx={{ color: 'white' }} className='capitalize'>{raceNameKey}</Typography>

                                        {/* Exibir Bônus - usando raceItem.bonus */}
                                        {raceItem.bonus && Object.values(raceItem.bonus).some(v => v !== 0) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ color: 'white', mt: 2, mb: 1, fontWeight: 'bold' }}>Bônus da Raça:</Typography>
                                                <Box className='grid grid-cols-2 gap-x-4 gap-y-1'>
                                                    {Object.entries(raceItem.bonus)
                                                        .filter(([_, valor]) => valor !== 0)
                                                        .map(([atributo, valor]) => (
                                                            <Typography key={atributo} /* ... */ >
                                                                {/* ... seu código de exibição de bônus ... */}
                                                            </Typography>
                                                        ))}
                                                </Box>
                                            </>
                                        )}

                                        {/* Exibir PdD - usando raceItem.pdd */}
                                        {raceItem.pdd && (raceItem.pdd.PdDFixo !== 0 || raceItem.pdd.PdDFração !== 0 || raceItem.pdd.AtributoUtilizado) && (
                                            <>
                                                <Typography variant='subtitle1' sx={{ color: 'white', mt: 2, mb: 1, fontWeight: 'bold' }}>Pontos de Deslocamento:</Typography>
                                                <Box sx={{ textAlign: 'left', pl: 1 }}>
                                                    {/* ... seu código de exibição de pdd ... */}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                    <Box className='flex justify-end gap-2 p-2 mt-auto'>
                                        {/* Passa o objeto 'raceItem' inteiro para handleOpenEdit */}
                                        <Button size="small" onClick={() => handleOpenEdit(raceItem)} sx={{ color: 'white' }}><Edit /></Button>
                                        {/* Passa 'raceNameKey' (string) para handleDelete */}
                                        <Button size="small" color="error" onClick={() => handleDelete(raceNameKey)} sx={{ color: 'lightcoral' }}><Delete /></Button>
                                    </Box>
                                </Card>
                            );
                        })
                    ) : (
                        !isLoadingRaces && !racesError && <p className='text-white'>Nenhuma raça encontrada.</p>
                    )}
                </div>
            </div>
            {/* Seu Dialog para Adicionar/Editar Raças (o código do dialog parece OK) */}
            <Dialog open={open} onClose={handleClose} PaperProps={{ ...}} >
                {/* ... (seu código do dialog) ... */}
            </Dialog>
            <Footer />
        </>
    );
}

export default Races;