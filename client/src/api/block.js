import axios from 'axios';
import { BASE_URL } from 'constants/const';

const getBlocksService = () => {
    return axios.get(`${BASE_URL}/block`)
        .then(res => res.data)
        .catch(err => console.log(err))
}

const getBlockService = (blockHash) => {
    return axios.get(`${BASE_URL}/block/${blockHash}`)
        .then(res => res.data)
        .catch(err => console.log(err))
}

const mineNextBlockService = (address) => {
    const promise = axios.post(`${BASE_URL}/mineBlock`, {
        address: address
    });
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

const mineTransactionService = (sender, recipient, amount) => {
    const promise = axios.post(`${BASE_URL}/mineTransaction`, {
        sender: sender,
        recipient: recipient,
        amount: amount,
    });
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}



export { getBlocksService, getBlockService, mineNextBlockService, mineTransactionService };