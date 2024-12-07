import axios from "axios";
import { BASE_URL } from "constants/const";

const accessWalletService = (method, privateKey, password, data) => {
    const promise = axios.post(`${BASE_URL}/accessWallet`, {
        method: method,
        privateKey: privateKey,
        password: password,
        data: data,
    });
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

const createWalletService = (method, password) => {
    const promise = axios.post(`${BASE_URL}/createWallet`, {
        method: method,
        password: password
    })
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

const sendTransactionService = async (sender, recipient, amount) => {
    const promise = axios.post(`${BASE_URL}/sendTransaction`, {
        sender: sender,
        recipient: recipient,
        amount: amount,
    });
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

const getHistoryService = async (address) => {
    const promise = axios.get(`${BASE_URL}/history?address=${address}`);
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

const getBalanceService = async (address) => {
    const promise = axios.get(`${BASE_URL}/getBalance?address=${address}`);
    const dataPromise = promise.then((res) => res.data);
    return dataPromise;
}

export { accessWalletService, createWalletService, sendTransactionService, getHistoryService, getBalanceService };