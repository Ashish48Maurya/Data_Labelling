"use client"
import React, { useEffect } from 'react'
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function Navbar() {
    return (
        <div className='flex justify-between h-[60px] items-center border-b-2 border-orange-500 px-[20px]'>
            <h2 className='font-bold text-lg'>EarnAsUGo</h2>
            <WalletMultiButton style={{backgroundColor:"orange", color:"black" }}/>
        </div>
    )
}