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

        <div className="justify-center pt-[3vh]">
            <div className=' mb-[3vh] bg-black mx-[4vw] rounded-[100px] text-white font-light flex justify-between items-center border-b-2 py-3 px-6'>
                <h2 className='pl-5 title'>Earn As You Go</h2>

                {person === "user" && (
                    <Link href='/user/task'>
                        <span className='hover:border-b-2 hover:border-orange-500 transition-all'>
                            Tasks
                        </span>
                    </Link>
                )}

                {publicKey && (
                    person === "worker" && (
                        <button
                            disabled={disable}
                            onClick={handlePayOut}
                            className='bg-black p-[10px] text-white transition-all duration-200 hover:font-semibold hover:text-[12px] text-[14px] rounded-[50px] border px-5 font-light hover:shadow-[2px_2px_5px_rgba(255,255,255,0.5)] tracking-wider'
                        >
                            {processing ? 'Processing...' : `Withdraw - $${amt?.$numberDecimal || 0} SOL`}
                        </button>

                    )
                )}

                <WalletMultiButton style={{ backgroundColor: "black", color: "black", borderRadius: "50px", fontSize: "15px", fontWeight: "lighter", color: "white" }} />
                {/* <WalletMultiButton className='bg-black text-yellow-300' /> */}
            </div>
        </div>

    );
}
