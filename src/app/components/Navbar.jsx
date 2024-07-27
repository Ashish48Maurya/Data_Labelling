"use client"
import React from 'react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import Link from 'next/link';
import { useAuth } from './context';

export default function Navbar() {
    const {person} = useAuth();
    return (
        <div className='flex justify-between h-[60px] items-center border-b-2 border-orange-500 px-[20px]'>
            <h2 className='font-bold text-lg'>EarnAsUGo</h2>
            
            {
                person=="user" && <Link href={'/user/task'}><span className=' font-medium hover:border-b-2 hover:border-orange-500 transition-all'>Tasks</span></Link>
            }
            <WalletMultiButton style={{ backgroundColor: "orange", color: "black" }} />
        </div>
    )
}






