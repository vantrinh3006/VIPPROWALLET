import axios from 'axios';
import { BASE_URL } from 'constants/const';

const getTransactionsService = async () => {
    const response = await axios.get(`${BASE_URL}/transaction`);
    return response.data;
}

const getTransactionService = async (transactionHash) => {
    const response = await axios.get(`${BASE_URL}/transaction/${transactionHash}`);
    return response.data;
}

const getTransactionPoolService = async () => {
    const response = await axios.get(`${BASE_URL}/transactionPool`);
    return response.data;
}

export { getTransactionsService, getTransactionService, getTransactionPoolService };