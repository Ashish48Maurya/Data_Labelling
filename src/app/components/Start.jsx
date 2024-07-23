"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast from "react-hot-toast";
import { decodeUTF8 } from "tweetnacl-util";

export default function Start() {
    const { publicKey, signMessage } = useWallet();
    const [mode, setMode] = useState('worker');
    const router = useRouter();
    const [isChecked, setIsChecked] = useState(true);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        setMode((prevMode) => (prevMode === 'worker' ? 'user' : 'worker'));
    };

    const signIn = async () => {
        if (!publicKey || !mode) {
            toast.error("Connect Wallet Please");
            return;
        }
        try {
            if (publicKey && mode) {
                let res;
                if (mode == 'user') {
                    const message = "SignIn To EarnAsUGo";
                    const messageBytes = decodeUTF8(message);
                    const signature = await signMessage(messageBytes)
                    res = await fetch('/api/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            signature,
                            publicKey,
                            message
                        })
                    });
                }
                else {
                    const message = "SignIn To EarnAsUGo";
                    const messageBytes = decodeUTF8(message);
                    const signature = await signMessage(messageBytes)
                    res = await fetch('/api/worker', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            signature,
                            publicKey,
                            message
                        })
                    });
                }
                const data = await res.json();
                if (!data.success) {
                    toast.error(data.message)
                }
                else {
                    toast.success(data.message);
                    if (mode == "worker") {
                        router.push('/worker')
                    } else {
                        router.push('/user')
                    }
                }
            }
        }
        catch (err) {
            toast.error(err.message)
        }
    }

    return (

        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex items-center mb-4">
                <label className="mr-2 font-semibold text-xl">User</label>
                <label className='flex cursor-pointer select-none items-center'>
                    <div className='relative'>
                        <input
                            type='checkbox'
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                            className='sr-only'
                        />
                        <div className={`box bg-black block h-8 w-14 rounded-full ${isChecked ? 'bg-primary' : 'bg-dark'}`}></div>
                        <div className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${isChecked ? 'translate-x-full' : ''}`}></div>
                    </div>
                </label>
                <label className="ml-2 font-semibold text-xl">Worker</label>
            </div>
            <WalletMultiButton style={{ backgroundColor: 'orange', color: 'black' }} />
            {
                publicKey && <button className=" cursor-pointer hover:bg-orange-400 hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white" onClick={() => { signIn() }}>SignIn and Continue</button>
            }
        </div>
    );
}
