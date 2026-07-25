import axios from 'axios';

const api = axios.create({
  baseURL: 'https://expense-flow-coral-nine.vercel.app/api/expenses',
});

export default api;
