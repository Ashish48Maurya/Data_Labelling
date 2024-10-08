"use client"
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/context';

export default function RootLayout({ children }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [],
        [network]
    );
    return (
        // <html lang="en" className='mx-[20px]'>
        <html lang="en">
            <body>
                <AuthProvider>
                    <ConnectionProvider endpoint={endpoint}>
                        <WalletProvider wallets={wallets} autoConnect>
                            <WalletModalProvider>
                                {children}
                                <Toaster />
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
