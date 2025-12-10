import express from 'express';
import cors from 'cors';

const app = express();

// Configuração básica
app.use(cors()); // Permite que o Frontend conecte aqui
app.use(express.json()); // Permite ler JSON nos pedidos

// Rota de Teste
app.get('/', (req, res) => {
    res.json({
        mensagem: 'Backend do Sistema de Drones Online! 🚁',
        status: 'operacional'
    });
});

// Inicialização
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log('   Pronto para receber comandos.\n');
});