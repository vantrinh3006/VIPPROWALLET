import { AppContext } from "Context";
import { getBlocksService, mineNextBlockService } from "api/block";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Blocks() {
    const context = useContext(AppContext);
    const { WalletInfo } = context;
    const navigate = useNavigate();
    const [blocks, setBlocks] = useState([]);

    const mineBlock = () => {
        mineNextBlockService(WalletInfo.publicKey).then((res) => {
            console.log(res);
            loadBlocks();
        }).catch(err => console.log(err));
    }

    const loadBlocks = () => {
        getBlocksService().then((res) => {
            setBlocks([...res.blocks.reverse()]);
        }).catch(err => console.log(err));
    }

    setTimeout(() => {
        loadBlocks();
    }, 1500);

    useEffect(() => {
        loadBlocks();
    }, []);

    return (
        <>
            <Container fluid className='d-flex pt-5 justify-content-start flex-column'>
                <Button variant="primary" onClick={mineBlock}>Mine block</Button>
                <Table striped bordered hover style={{ maxWidth: "calc(100vw-300)" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "9%" }}>Block#</th>
                            <th style={{ width: "13%" }}>Create at</th>
                            <th style={{ width: "18%" }}>Transaction length</th>
                            <th style={{ width: "15%" }}>Nonce</th>
                            <th style={{ width: "45%" }}>Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            blocks?.map((block, index) => {
                                return (
                                    <tr key={block.hash} role="button" onClick={() => navigate(`/block/${block.hash}`)}>
                                        <td>{block.index}</td>
                                        <td>{moment.unix(block.timestamp).fromNow()}</td>
                                        <td>{block.data.length}</td>
                                        <td>{block.nonce}</td>
                                        <td>{block.hash}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </>
    );
}

export default Blocks;