import { useState } from "react";
import React from 'react';

export const AppContext = React.createContext(null);
export default function Context({ children }) {
    const [AccessStatus, setAccessStatus] = useState(false);
    const [WalletInfo, setWalletInfo] = useState({ publicKey: "", privateKey: "", balance: 0 });
    const [blockchain, setBlockchain] = useState(null);
    const [autoMine, setAutoMine] = useState(false);

    const exportContext = {
        AccessStatus,
        WalletInfo,
        setAccessStatus,
        setWalletInfo,
        blockchain,
        setBlockchain, 
        autoMine,
        setAutoMine
    }


    return <AppContext.Provider value={exportContext} >{children}</AppContext.Provider>
}