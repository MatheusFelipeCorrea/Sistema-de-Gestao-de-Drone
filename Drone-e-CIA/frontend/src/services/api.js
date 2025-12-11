import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // Porta onde o Node vai rodar depois
});

export default api;