import { getBlockService } from 'api/block';
import React, { useEffect, useState } from 'react'
import { Col, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io';

export default function BlockWithHash() {
    const { hash } = useParams();
    const [block, setBlock] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        getBlockService(hash).then((res) => {
            setBlock(res.block);
            console.log(res.block);
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
                        <th style={{ width: "10%" }}>Index</th>
                        <td>{block?.index}</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Nonce</th>
                        <td>{block?.nonce}</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Difficulty</th>
                        <td>{block?.difficulty}</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Previous hash</th>
                        <td>{block?.previousHash}</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Hash</th>
                        <td>{block?.hash}</td>
                    </tr>
                    <tr>
                        <th style={{ width: "10%" }}>Timestamp</th>
                        <td>{block?.timestamp}</td>
                    </tr>
                    <tr>
                        <th colSpan={2}>Data</th>
                    </tr>
                </tbody>
            </Table>
        </>
    )
}
