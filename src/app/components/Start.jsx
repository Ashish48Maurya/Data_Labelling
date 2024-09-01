"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast from "react-hot-toast";
import { decodeUTF8 } from "tweetnacl-util";
import { useAuth } from "./context";
import VanillaTilt from "vanilla-tilt";

export default function Start() {
    const { publicKey, signMessage } = useWallet();
    const { setPerson } = useAuth();
    const [mode, setMode] = useState('worker');
    const router = useRouter();
    const [isChecked, setIsChecked] = useState(true);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        setMode((prevMode) => (prevMode === 'worker' ? 'user' : 'worker'));
    };

    useEffect(() => {
        const element = document.querySelector(".main-content");
        VanillaTilt.init(element, {
            max: 10,
            speed: 1200,
            glare: true,
            "max-glare": 0.6,
            scale: 1.2,
            perspective: 1000,
            transition: true,
            easing: "cubic-bezier(.03,.98,.52,.99)",
            reset: true,
        });

        // Apply parallax effect to children
        const children = element.querySelectorAll(".parallax-child");
        children.forEach((child, index) => {
            child.style.transform = `translateZ(${index * 10}px)`;
        });
    }, []);

    const signIn = async () => {
        if (!publicKey || !mode) {
            toast.error("Connect Wallet Please");
            return;
        }
        try {
            if (publicKey && mode) {
                setPerson(mode)
                let res;
                const message = "SignIn To EarnAsUGo";
                const messageBytes = decodeUTF8(message);
                const signature = await signMessage(messageBytes);

                if (mode === 'user') {
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
                } else {
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
                    router.push(`/${mode}`);
                }
            }
        }
        catch (err) {
            toast.error(err.message)
        }
    }


    return (
        <div
            className="flex flex-col items-center justify-center bg-black min-h-screen"
            style={{
                backgroundImage: 'radial-gradient(circle 1292px at -13.6% 51.7%, rgba(0,56,68,1) 0%, rgba(163,217,185,1) 51.5%, rgba(255,252,247,1) 88.6%) '
            }}
        >


            <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 border-2 border-white p-4 rounded-xl shadow-md main-content hover:shadow-[3px_3px_6px_rgba(0,0,0,0.7)]"


                style={{
                    backgroundColor: '#8EC5FC',
                    backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
                }}>

                <div className="flex items-center gap-6 parallax-child">
                    {/* phantum wallet button */}
                    <div className="items-center bg-white rounded-md flex justify-center w-[8.8vw] h-[35px] shadow-md parallax-child">
                        <WalletMultiButton style={{ backgroundColor: 'transparent', color: '#333', font: 'small-caption', height: '35px', zIndex: '100' }} />
                    </div>

                    {/* sign in & continue button */}
                    {
                        publicKey && <button className="cursor-pointer font-light bg-black text-white text-xs w-[80px] h-[35px] rounded-md hover:bg-white hover:text-black hover:font-bold transition-all duration-300 shadow-md parallax-child" onClick={() => { signIn() }}>Sign In</button>
                    }
                </div>

                {/* first page select either user or worker */}
                <div className="flex justify-center items-center border py-2 rounded-md px-2 text-md mt-3 bg-opacity-30 backdrop-filter backdrop-blur-lg parallax-child">
                    <label className="px-2 text-white font-semibold">User</label>
                    <label className='flex cursor-pointer select-none items-center'>
                        <div className='relative parallax-child'>
                            <input
                                type='checkbox'
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                                className='sr-only'
                            />
                            <div className={`box bg-black block h-6 w-10 rounded-full ${isChecked ? 'bg-primary' : 'bg-dark'}`}></div>
                            <div className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${isChecked ? 'translate-x-full' : ''}`}></div>
                        </div>
                    </label>
                    <label className="px-2 text-white font-semibold">Worker</label>
                </div>

            </div>

        </div>
    );
}
