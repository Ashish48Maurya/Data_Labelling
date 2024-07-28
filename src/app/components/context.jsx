"use client";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useState, createContext, useContext,useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

// import { useRouter } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [], [network]);
    const [person,setPerson] = useState('worker');
    const [amt,setAmt] = useState(0);

    return (
        <AuthContext.Provider value={{wallets, endpoint,setPerson,setAmt,amt }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

