"use client";
import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import Link from 'next/link';
import { useAuth } from './context';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { person, amt, setAmt } = useAuth();
    const { publicKey } = useWallet();
    const [disable, setDisable] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handlePayOut = async () => {
        console.log("called");
        setDisable(true);
        setProcessing(true);
        try {
            const res = await fetch('/api/worker/payout', {
                method: "PUT",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ publicKey })
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "An error occurred");
            } else {
                setAmt(0);
                toast.success(data.message || "Payout successful");
            }
        } catch (err) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setDisable(false);
            setProcessing(false);
        }
    };

    return (
        <div className='flex justify-between h-[60px] items-center border-b-2 border-orange-500 px-[20px]'>
            <h2 className='font-bold text-sm lg:text-lg'>EarnAsUGo</h2>

            {person === "user" && (
                <Link href='/user/task'>
                    <span className='font-medium hover:border-b-2 hover:border-orange-500 transition-all'>
                        Tasks
                    </span>
                </Link>
            )}

            {publicKey && (
                person === "worker" && (
                    <button
                        disabled={disable}
                        onClick={handlePayOut}
                        className='bg-black p-[10px] text-white font-semibold rounded-md'
                    >
                        {processing ? 'Processing...' : `Withdraw - ${amt?.$numberDecimal || 0} SOL`}
                    </button>
                )
            )}

            <WalletMultiButton style={{ backgroundColor: "orange", color: "black" }} />
        </div>
    );
}
