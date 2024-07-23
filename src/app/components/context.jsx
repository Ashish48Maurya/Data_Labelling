"use client";
import React, { useState, createContext, useContext, useMemo } from 'react';

// import { useRouter } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [], [network]);

    return (
        <AuthContext.Provider value={{ wallets, endpoint }}>
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




