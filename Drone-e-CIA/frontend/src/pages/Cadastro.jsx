import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function Cadastro() {
    const navigate = useNavigate();

    const [coordInput, setCoordInput] = useState('');

    const [formData, setFormData] = useState({
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        complemento: '',
        lat: '',
        lng: '',
        peso: '',
        prioridade: 'Baixa'
    });

    const [errors, setErrors] = useState({});
    const [showWeightAlert, setShowWeightAlert] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // --- FUNÇÃO: TRAVA O PESO ---
    const handlePesoChange = (e) => {
        let valor = e.target.value;
        if (valor === '') {
            handleChange('peso', '');
            return;
        }
        const numero = parseFloat(valor);
        if (numero < 0) return;
        if (numero > 12) {
            handleChange('peso', '12');
            setShowWeightAlert(true);
            return;
        }
        handleChange('peso', valor);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.cep) newErrors.cep = "O CEP é obrigatório.";
        else if (formData.cep.length < 8) newErrors.cep = "CEP incompleto.";
        if (!formData.endereco) newErrors.endereco = "O endereço é obrigatório.";
        if (!formData.bairro) newErrors.bairro = "O bairro é obrigatório.";
        if (!formData.numero) newErrors.numero = "O número é obrigatório.";
        if (!formData.peso) newErrors.peso = "Informe o peso.";
        else if (Number(formData.peso) <= 0) newErrors.peso = "Peso inválido.";
        if (!formData.lat && !coordInput) newErrors.coordenadas = "Localização não encontrada.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buscarCoordenadas = async (endereco, numero, bairro) => {
        if (!endereco) return;
        const query = `${endereco}, ${numero ? numero : ''}, ${bairro || ''}, Belo Horizonte, MG`;
        try {
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            if (geoRes.data && geoRes.data[0]) {
                const { lat, lon } = geoRes.data[0];
                setFormData(prev => ({ ...prev, lat: lat, lng: lon }));
                setCoordInput(`${lat}, ${lon}`);
                setErrors(prev => ({ ...prev, coordenadas: '' }));
            }
        } catch (err) {
            console.error("Erro GPS", err);
        }
    };

    const handleCoordBlur = () => {
        if (!coordInput) return;
        const parts = coordInput.split(',');
        if (parts.length === 2) {
            setFormData(prev => ({ ...prev, lat: parts[0].trim(), lng: parts[1].trim() }));
            setErrors(prev => ({ ...prev, coordenadas: '' }));
        } else {
            setErrors(prev => ({ ...prev, coordenadas: "Formato inválido (Lat, Long)" }));
        }
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length > 0 && cep.length < 8) {
            setErrors(prev => ({ ...prev, cep: "CEP incompleto." }));
            return;
        }
        if (cep.length === 8) {
            setErrors(prev => ({ ...prev, cep: '' }));
            try {
                const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!res.data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco: res.data.logradouro,
                        bairro: res.data.bairro,
                    }));
                    setErrors(prev => ({ ...prev, endereco: '', bairro: '' }));
                    buscarCoordenadas(res.data.logradouro, formData.numero, res.data.bairro);
                } else {
                    setErrors(prev => ({ ...prev, cep: "CEP não encontrado." }));
                }
            } catch (error) {
                console.error("Erro CEP", error);
            }
        }
    };

    const handleManualBlur = () => {
        if (formData.endereco.length > 3) {
            buscarCoordenadas(formData.endereco, formData.numero, formData.bairro);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (Number(formData.peso) > 12) {
            setShowWeightAlert(true);
            return;
        }
        let finalLat = formData.lat;
        let finalLng = formData.lng;
        if (!finalLat && coordInput.includes(',')) {
            const parts = coordInput.split(',');
            finalLat = parts[0].trim();
            finalLng = parts[1].trim();
        }
        const pedido = {
            endereco: `${formData.endereco}, ${formData.numero}`,
            bairro: formData.bairro || 'Centro',
            coordenadas: {
                lat: parseFloat(finalLat) || -19.9208,
                lng: parseFloat(finalLng) || -43.9378
            },
            peso: formData.peso,
            prioridade: formData.prioridade
        };
        try {
            await api.post('/pedidos', pedido);
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao salvar pedido.");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-10 relative">

            {/* MODAL DE ERRO DE PESO (Sem animação) */}
            {showWeightAlert && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm">
                    {/* Removido 'animate-bounce' daqui */}
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-8 border-red-500 relative">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Carga Excedida!</h3>
                        <p className="text-gray-600 mb-6">
                            Travamos o valor em <strong>12kg</strong> pois é o limite máximo de segurança do drone.
                        </p>
                        <button
                            onClick={() => setShowWeightAlert(false)}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition">
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE SUCESSO (Sem animação) */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm">
                    {/* Removido 'animate-pulse' daqui */}
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Pedido Criado!</h3>
                        <p className="text-gray-600 mb-8">
                            O drone já foi notificado e o pedido entrou na fila de prioridade.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                                Ir ao Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-[#000040] text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                                Novo Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="bg-[#000040] py-4 shadow-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between relative">
                    <button onClick={() => navigate('/')} className="bg-[#000040] border border-blue-900 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition shadow-lg z-10">
                        <div className="bg-[#ff5722] p-1 rounded flex-shrink-0"><ArrowLeft size={18} className="text-white" /></div>
                        <span className="font-bold hidden sm:inline text-sm">Voltar</span>
                    </button>
                    <div className="absolute left-0 right-0 text-center pointer-events-none">
                        <h1 className="text-lg md:text-2xl font-bold text-white tracking-wider pointer-events-auto inline-block">Drone e CIA</h1>
                    </div>
                    <div className="w-[80px] hidden sm:block"></div>
                </div>
            </header>

            <div className="flex justify-center items-start pt-6 px-4 md:pt-8 md:px-6">
                <div className="bg-[#d9d9d9] rounded-[20px] shadow-xl w-full max-w-[900px] p-5 md:p-10 border border-gray-300">

                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-black pb-1 mb-4 w-full">
                            Informações Gerais da Entrega
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Endereço (Rua/Av)</label>
                                <input
                                    type="text"
                                    className={`w-full border ${errors.endereco ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 outline-none h-[45px] transition`}
                                    value={formData.endereco}
                                    onChange={e => handleChange('endereco', e.target.value)}
                                    onBlur={handleManualBlur}
                                    placeholder="Digite o endereço..."
                                />
                                {errors.endereco && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.endereco}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">CEP</label>
                                    <input
                                        type="text"
                                        maxLength="9"
                                        className={`w-full border ${errors.cep ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 outline-none h-[45px] transition`}
                                        value={formData.cep}
                                        onChange={e => handleChange('cep', e.target.value)}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                    />
                                    {errors.cep && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.cep}</span>}
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Bairro</label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.bairro ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 outline-none h-[45px] transition`}
                                        value={formData.bairro}
                                        onChange={e => handleChange('bairro', e.target.value)}
                                        onBlur={handleManualBlur}
                                    />
                                    {errors.bairro && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.bairro}</span>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Número</label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.numero ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 outline-none h-[45px] transition`}
                                        value={formData.numero}
                                        onChange={e => handleChange('numero', e.target.value)}
                                        onBlur={handleManualBlur}
                                        placeholder="123"
                                    />
                                    {errors.numero && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.numero}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Complemento</label>
                                    <input type="text" className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px]"
                                           value={formData.complemento} onChange={e => handleChange('complemento', e.target.value)} />
                                </div>
                                <div className="md:col-span-8">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Coordenadas (Lat, Long)</label>
                                    <input
                                        type="text"
                                        className={`w-full border ${errors.coordenadas ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 bg-gray-200 outline-none h-[45px] text-gray-600 font-mono text-xs md:text-sm font-bold`}
                                        value={coordInput}
                                        onChange={e => setCoordInput(e.target.value)}
                                        onBlur={handleCoordBlur}
                                        placeholder="Ex: -19.9208, -43.9378"
                                    />
                                    {errors.coordenadas && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.coordenadas}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-black pb-1 mb-4 w-full">Informações Gerais do Item</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full md:max-w-[600px]">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Peso (Máx 12kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="12"
                                        step="0.1"
                                        className={`w-full border ${errors.peso ? 'border-red-500 bg-red-50' : 'border-black'} rounded-[10px] p-2 outline-none h-[45px] pr-10 text-right`}
                                        value={formData.peso}
                                        onChange={handlePesoChange}
                                    />
                                    <span className="absolute right-3 top-3 text-sm text-gray-600 font-bold">Kg</span>
                                </div>
                                {errors.peso && <span className="text-red-600 text-xs font-bold ml-1 mt-1 block">{errors.peso}</span>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Prioridade</label>
                                <select className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px] cursor-pointer"
                                        value={formData.prioridade} onChange={e => handleChange('prioridade', e.target.value)}>
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4">
                        <button onClick={() => navigate('/')} className="w-full md:w-auto bg-[#ef4444] hover:bg-red-600 text-black border border-black px-6 py-3 md:py-2 rounded-[10px] font-medium transition shadow-sm">Cancelar</button>
                        <button onClick={handleSubmit} className="w-full md:w-auto bg-[#22c55e] hover:bg-green-600 text-black border border-black px-6 py-3 md:py-2 rounded-[10px] font-medium transition shadow-sm">Adicionar Pedido</button>
                    </div>
                </div>
            </div>
        </div>
    );
}