import { getTransactionService } from 'api/transaction';
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom'

export default function TransactionWithHash() {
    const { hash } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState(null);
    useEffect(() => {
        getTransactionService(hash).then((res) => {
            // setTransactions(res.block);
            console.log(res);
        }).catch(err => console.log(err));
    }, []);
    return (
        <>
            <div className='d-inline-flex align-items-center'>
                <IoIosArrowBack className='bg-info rounded-circle' size={30} role='button' onClick={() => navigate(-1)} />
            </div>

            <Table bordered striped hover className='mt-3 mx-3'>
                <tbody>
                    <tr>
                        <th style={{ width: "10%" }}>Txn Hash</th>
                        <td></td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Nonce</th>
                        <td>xxx</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Nonce</th>
                        <td>xxx</td>
                    </tr>
                </tbody>
            </Table>

        </>
    )
}
