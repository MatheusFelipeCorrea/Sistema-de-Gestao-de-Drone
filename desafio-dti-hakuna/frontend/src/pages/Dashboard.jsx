import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, LayoutDashboard, History, PackageCheck, Clock } from 'lucide-react';
import api from '../services/api';

// --- Configuração dos Ícones do Mapa ---
const createDroneIcon = (color) => new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
         </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -20]
});

const iconBase = createDroneIcon('#f97316');
const iconActive = createDroneIcon('#3b82f6');

export default function Dashboard() {
    const navigate = useNavigate();

    const [data, setData] = useState({
        metricas: { entregas: 0, viagens: 0, eficiencia: '100%', droneEficiente: '-', tempoMedio: '-' },
        drones: [],
        pedidos: [],
        historico: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Erro dashboard:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        const map = {
            'IDLE': 'bg-gray-200 text-gray-700',
            'CARREGANDO': 'bg-purple-100 text-purple-700',
            'EM_VOO': 'bg-blue-100 text-blue-700',
            'ENTREGANDO': 'bg-orange-100 text-orange-700',
            'RETORNANDO': 'bg-yellow-100 text-yellow-700'
        };
        return map[status] || 'bg-gray-100';
    };

    const renderBateria = (nivelTexto, porcentagem) => {
        let cor = 'bg-green-500';
        if (porcentagem < 50) cor = 'bg-yellow-500';
        if (porcentagem < 20) cor = 'bg-red-600';

        return (
            <div className="w-full min-w-[80px]">
                <div className="flex justify-between text-xs mb-1 font-bold text-gray-600">
                    <span className="hidden sm:inline">{nivelTexto}</span>
                    <span>{porcentagem || 100}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden border border-gray-400">
                    <div
                        className={`h-2.5 rounded-full ${cor} transition-all duration-1000 ease-linear`}
                        style={{ width: `${porcentagem || 100}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-20">

            {/* HEADER RESPONSIVO */}
            <header className="bg-[#000040] text-white p-4 shadow-lg sticky top-0 z-[1000]">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold flex flex-wrap justify-center md:justify-start items-center gap-2 tracking-wide">
                        Drone e CIA
                        <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full font-normal whitespace-nowrap">Simulador v1.0</span>
                    </h1>
                    <div className="flex w-full md:w-auto gap-3">
                        <button className="flex-1 md:flex-none justify-center items-center gap-2 bg-[#00b0ff] px-4 py-2 rounded-lg font-bold shadow hover:brightness-110 transition cursor-default text-sm md:text-base">
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/cadastrar')}
                            className="flex-1 md:flex-none justify-center items-center gap-2 bg-[#ff5722] px-4 py-2 rounded-lg font-bold shadow hover:brightness-110 transition cursor-pointer text-sm md:text-base">
                            <Plus size={18} /> <span className="hidden sm:inline">Cadastrar</span> Pedido
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

                {/* METRICAS - Grid Responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <MetricCard label="Entregas Realizadas" value={`${data.metricas.entregas}`} suffix="Entregas" />
                    <MetricCard label="Viagens Realizadas" value={`${data.metricas.viagens}`} suffix="Viagens" />
                    {/* Exibe o tempo médio real calculado no backend */}
                    <MetricCard label="Tempo médio/Entrega" value={data.metricas.tempoMedio} />
                    <MetricCard label="Drone Eficiente" value={`ID: ${data.metricas.droneEficiente}`} />
                </div>

                {/* STATUS + MAPA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">

                    {/* Tabela de Status */}
                    <div className="lg:col-span-5 bg-[#e0e0e0] rounded-xl shadow-md p-4 overflow-hidden flex flex-col border border-gray-300 h-[400px] lg:h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2 flex items-center gap-2">
                            Status dos Drones
                        </h3>
                        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar bg-white rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left min-w-[500px] lg:min-w-full">
                                    <thead className="text-gray-700 font-bold bg-gray-100 sticky top-0 shadow-sm z-10">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Capacidade</th>
                                        <th className="p-3 min-w-[100px]">Bateria</th>
                                        {/* Mantive sua responsividade, mas adicionei ETA de volta */}
                                        <th className="p-3">ETA</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data.drones.map((drone) => (
                                        <tr key={drone.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-bold text-gray-800">{drone.id}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getStatusColor(drone.status)}`}>
                                                    {drone.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 font-medium">{drone.capacidadeRestante}kg</td>
                                            <td className="p-3">{renderBateria(drone.bateria, drone.bateriaPercentual)}</td>
                                            <td className="p-3 text-xs font-bold text-blue-600 bg-blue-50 rounded text-center">
                                                {drone.eta || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="lg:col-span-7 bg-[#e0e0e0] rounded-xl shadow-md p-4 border border-gray-300 relative z-0 flex flex-col h-[400px] lg:h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2">Localização em Tempo Real</h3>
                        <div className="flex-1 rounded-lg overflow-hidden border border-white shadow-inner relative">
                            <MapContainer center={[-19.9208, -43.9378]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                {data.drones.map((drone) => (
                                    <Marker key={drone.id} position={[drone.lat, drone.lng]} icon={drone.status === 'IDLE' || drone.status === 'CARREGANDO' ? iconBase : iconActive}>
                                        <Popup>
                                            <div className="text-center min-w-[150px]">
                                                <strong className="block text-blue-700 text-lg mb-1">Drone {drone.id}</strong>

                                                <div className="bg-gray-100 p-2 rounded mb-2 border border-gray-200">
                                                    <div className="text-gray-600 text-xs uppercase font-bold">Status</div>
                                                    <div className={`text-sm font-bold ${getStatusColor(drone.status).split(' ')[1]}`}>{drone.status}</div>
                                                </div>

                                                {/* Reintroduzindo o ETA no Popup */}
                                                <div className="flex justify-between items-center text-xs mb-1 px-1">
                                                    <span className="font-bold text-gray-500">Estimativa:</span>
                                                    <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock size={12}/> {drone.eta || '-'}
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 h-2 mt-1 rounded-full overflow-hidden">
                                                    <div className="bg-green-500 h-full" style={{width: drone.bateriaPercentual + '%'}}></div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">Bateria: {drone.bateriaPercentual}%</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                <Marker position={[-19.9208, -43.9378]} icon={iconBase}><Popup>BASE</Popup></Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* FILA DE PEDIDOS */}
                <div className="bg-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6 border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2 flex items-center gap-2">
                        Fila de Pedidos
                    </h3>
                    <div className="overflow-x-auto bg-white rounded-lg max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Endereço</th>
                                <th className="px-4 py-3">Peso</th>
                                <th className="px-4 py-3">Prioridade</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {data.pedidos.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-400 font-medium">Nenhum pedido pendente.</td></tr>
                            ) : (
                                data.pedidos.map((pedido) => (
                                    <tr key={pedido.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500 font-bold">#{pedido.id.substring(0,6)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[150px]">{pedido.endereco}</td>
                                        <td className="px-4 py-3 font-bold text-gray-600">{pedido.peso} kg</td>
                                        <td className="px-4 py-3"><BadgePrioridade nivel={pedido.prioridade} /></td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap
                                                ${pedido.status === 'Carregando' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {pedido.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HISTÓRICO DE ENTREGAS */}
                <div className="bg-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6 border border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2 flex items-center gap-2">
                        <History size={24} className="text-gray-600" /> <span className="hidden sm:inline">Histórico de</span> Concluídos
                    </h3>
                    <div className="overflow-x-auto bg-white rounded-lg max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left min-w-[700px]">
                            <thead className="bg-gray-200 text-gray-700 font-bold uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Endereço</th>
                                <th className="px-4 py-3">Prioridade</th>
                                <th className="px-4 py-3">Entrega</th>
                                {/* Coluna nova para mostrar tempo total real */}
                                <th className="px-4 py-3">Tempo Total</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {(!data.historico || data.historico.length === 0) ? (
                                <tr><td colSpan="6" className="text-center py-6 text-gray-400 font-medium">Nenhuma entrega finalizada ainda.</td></tr>
                            ) : (
                                data.historico.map((pedido) => (
                                    <tr key={pedido.id} className="hover:bg-gray-50 bg-gray-50/50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400 font-bold line-through">#{pedido.id.substring(0,6)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-500 truncate max-w-[150px]">{pedido.endereco}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{pedido.prioridade}</td>
                                        <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">{pedido.entregueEm}</td>
                                        <td className="px-4 py-3 font-bold text-blue-600">{pedido.tempoTotal}</td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border bg-green-100 text-green-700 border-green-200 w-fit whitespace-nowrap">
                                                <PackageCheck size={14} /> Concluído
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Componentes Pequenos (Ajustados) ---
function MetricCard({ label, value, suffix = '' }) {
    return (
        <div className="bg-[#e0e0e0] p-4 md:p-6 rounded-xl shadow-md border-l-4 border-gray-400 flex flex-col justify-center items-center text-center hover:scale-[1.02] transition-transform">
            <h4 className="text-gray-800 text-sm md:text-base font-bold mb-2 w-full border-b border-gray-300 pb-1 truncate">{label}</h4>
            <span className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                {value} <span className="text-sm font-medium text-gray-600 block sm:inline">{suffix}</span>
            </span>
        </div>
    );
}

function BadgePrioridade({ nivel }) {
    const colors = { 'Alta': 'bg-red-100 text-red-700', 'Média': 'bg-yellow-100 text-yellow-700', 'Baixa': 'bg-green-100 text-green-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${colors[nivel] || colors['Baixa']}`}>{nivel}</span>;
}