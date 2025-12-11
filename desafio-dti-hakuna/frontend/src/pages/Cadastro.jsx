import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function Cadastro() {
    const navigate = useNavigate();

    // Estado do input visual das coordenadas (Texto livre)
    const [coordInput, setCoordInput] = useState('');

    // Estado do formulário
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

    // Função que busca a coordenada no mapa (Nominatim)
    const buscarCoordenadas = async (endereco, numero, bairro) => {
        if (!endereco) return;

        const query = `${endereco}, ${numero ? numero : ''}, ${bairro || ''}, Belo Horizonte, MG`;
        console.log("📍 Buscando GPS para:", query);

        try {
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);

            if (geoRes.data && geoRes.data[0]) {
                const { lat, lon } = geoRes.data[0];

                setFormData(prev => ({
                    ...prev,
                    lat: lat,
                    lng: lon
                }));

                setCoordInput(`${lat}, ${lon}`);
            }
        } catch (err) {
            console.error("Erro ao buscar coordenadas:", err);
        }
    };

    // Quando o usuário DIGITA manualmente as coordenadas e sai do campo (Blur)
    const handleCoordBlur = () => {
        if (!coordInput) return;

        const parts = coordInput.split(',');

        if (parts.length === 2) {
            const lat = parts[0].trim();
            const lng = parts[1].trim();

            setFormData(prev => ({
                ...prev,
                lat: lat,
                lng: lng
            }));
            console.log("📍 Coordenadas manuais definidas:", lat, lng);
        } else {
            alert("Formato de coordenada inválido! Use: Latitude, Longitude");
        }
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!res.data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco: res.data.logradouro,
                        bairro: res.data.bairro,
                    }));
                    buscarCoordenadas(res.data.logradouro, formData.numero, res.data.bairro);
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

    const handleSubmit = async () => {
        if (!formData.endereco || !formData.peso) {
            alert("Por favor, preencha pelo menos o Endereço e o Peso.");
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
            alert("Pedido adicionado com sucesso! 🚁");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar pedido.");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-10">

            {/* HEADER RESPONSIVO */}
            <header className="bg-[#000040] py-4 shadow-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between relative">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#000040] border border-blue-900 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition shadow-lg z-10">
                        <div className="bg-[#ff5722] p-1 rounded flex-shrink-0">
                            <ArrowLeft size={18} className="text-white" />
                        </div>
                        <span className="font-bold hidden sm:inline text-sm">Voltar</span>
                    </button>

                    {/* Título centralizado absolutamente para garantir alinhamento */}
                    <div className="absolute left-0 right-0 text-center pointer-events-none">
                        <h1 className="text-lg md:text-2xl font-bold text-white tracking-wider pointer-events-auto inline-block">
                            Drone e CIA
                        </h1>
                    </div>

                    {/* Espaçador invisível para manter equilíbrio se precisar de botão à direita no futuro */}
                    <div className="w-[80px] hidden sm:block"></div>
                </div>
            </header>

            <div className="flex justify-center items-start pt-6 px-4 md:pt-8 md:px-6">
                <div className="bg-[#d9d9d9] rounded-[20px] shadow-xl w-full max-w-[900px] p-5 md:p-10 border border-gray-300">

                    {/* SEÇÃO 1: ENDEREÇO */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-black pb-1 mb-4 w-full">
                            Informações Gerais da Entrega
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Endereço (Rua/Av)</label>
                                <input
                                    type="text"
                                    className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px] focus:border-blue-600 transition"
                                    value={formData.endereco}
                                    onChange={e => setFormData({...formData, endereco: e.target.value})}
                                    onBlur={handleManualBlur}
                                    placeholder="Digite o endereço ou preencha o CEP..."
                                />
                            </div>

                            {/* Grid Responsivo: 1 col (mobile), 12 cols (desktop) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">CEP</label>
                                    <input
                                        type="text"
                                        maxLength="9"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px]"
                                        value={formData.cep}
                                        onChange={e => setFormData({...formData, cep: e.target.value})}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Bairro</label>
                                    <input
                                        type="text"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px]"
                                        value={formData.bairro}
                                        onChange={e => setFormData({...formData, bairro: e.target.value})}
                                        onBlur={handleManualBlur}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Número</label>
                                    <input
                                        type="text"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px]"
                                        value={formData.numero}
                                        onChange={e => setFormData({...formData, numero: e.target.value})}
                                        onBlur={handleManualBlur}
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Complemento</label>
                                    <input
                                        type="text"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px]"
                                        value={formData.complemento}
                                        onChange={e => setFormData({...formData, complemento: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-8">
                                    <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Coordenadas (Lat, Long)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px] text-gray-700 font-mono text-xs md:text-sm font-bold focus:border-blue-600 transition"
                                        value={coordInput}
                                        onChange={e => setCoordInput(e.target.value)}
                                        onBlur={handleCoordBlur}
                                        placeholder="Ex: -19.9208, -43.9378"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: ITEM */}
                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-black pb-1 mb-4 w-full">
                            Informações Gerais do Item
                        </h2>

                        {/* No mobile ocupa full width, no desktop max-w-600 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full md:max-w-[600px]">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Peso (Máx 12kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px] pr-10 text-right"
                                        value={formData.peso}
                                        onChange={e => setFormData({...formData, peso: e.target.value})}
                                    />
                                    <span className="absolute right-3 top-3 text-sm text-gray-600 font-bold">Kg</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 ml-1 font-semibold">Prioridade</label>
                                <select
                                    className="w-full border border-black rounded-[10px] p-2 bg-white outline-none h-[45px] cursor-pointer"
                                    value={formData.prioridade}
                                    onChange={e => setFormData({...formData, prioridade: e.target.value})}>
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* BOTÕES: Flex-col no mobile (um embaixo do outro), Row no desktop */}
                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full md:w-auto bg-[#ef4444] hover:bg-red-600 text-black border border-black px-6 py-3 md:py-2 rounded-[10px] font-medium transition shadow-sm active:scale-95">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="w-full md:w-auto bg-[#22c55e] hover:bg-green-600 text-black border border-black px-6 py-3 md:py-2 rounded-[10px] font-medium transition shadow-sm active:scale-95">
                            Adicionar Pedido
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}