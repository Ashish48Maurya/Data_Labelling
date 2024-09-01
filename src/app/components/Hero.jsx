"use client"
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import VanillaTilt from 'vanilla-tilt'; // Import VanillaTilt
import { Transaction, SystemProgram, PublicKey, Connection as SolanaConnection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import '@/app/globals.css';

export default function Hero() {
    const wHeight = window.innerHeight * 0.89;
    const [files, setFiles] = useState([]);
    const [dfiles, setDFiles] = useState([]);
    const [text, setText] = useState();
    const [loader, setLoader] = useState(false);
    const amount = process.env.NEXT_PUBLIC_AMT;
    const { publicKey, sendTransaction } = useWallet();
    const token = localStorage.getItem('token');
    const [sign, setSign] = useState(null);
    const uploadedFileUrls = [];
    const tiltRef = useRef([]);

    useEffect(() => {
        if (tiltRef.current) {
            tiltRef.current.forEach((element) => {
                if (element) {
                    VanillaTilt.init(element, {
                        max: 10,
                        speed: 150,
                        glare: false,
                        "max-glare": 0.5,
                    });
                }
            });
        }

        return () => {
            if (tiltRef.current) {
                tiltRef.current.forEach((element) => {
                    if (element && element.vanillaTilt) {
                        element.vanillaTilt.destroy();
                    }
                });
            }
        };
    }, [dfiles]);

    const saveTask = async () => {
        const Signature = localStorage.getItem('txnSignature');
        console.log(Signature);
        console.log(uploadedFileUrls, text, amount, Signature);
        const res = await fetch('/api/user/task', {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                uploadedFileUrls,
                text,
                amount,
                Signature: localStorage.getItem('txnSignature'),
            })
        });
        const ans = await res.json();
        if (!ans.success) {
            toast.error("Task Submission Failed, Please try Again");
            return;
        } else {
            toast.success("Task Submitted");
            localStorage.removeItem('txnSignature');
            setDFiles([]);
            setFiles([]);
        }
        console.log(ans);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            toast.error('No files selected');
            return;
        }

        try {
            setLoader(true);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Uploading file: ${file.name}`);

                try {
                    const presignedUrlResponse = await fetch('/api/user', {
                        method: "GET",
                        credentials: 'include',
                    });
                    const { data: presignedUrl } = await presignedUrlResponse.json();

                    const response = await fetch(presignedUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type,
                        },
                        body: file
                    });

                    if (response.ok) {
                        toast.success(`File ${file.name} uploaded successfully`);
                        uploadedFileUrls.push(presignedUrl.split('?')[0]);
                    } else {
                        console.error(`Upload failed for ${file.name}:`, response.statusText);
                        toast.error(`Upload failed for ${file.name}: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    toast.error(`Error uploading file ${file.name}: ${error.message}`);
                }
            }

            if (uploadedFileUrls.length === files.length) {
                await saveTask();
            } else {
                toast.error('Some files failed to upload. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred during the upload process.');
        } finally {
            setLoader(false);
        }
    };

    const pay = async () => {
        const connection = new SolanaConnection("https://api.devnet.solana.com");

        if (!publicKey) {
            toast.error("Wallet not connected");
            return;
        }

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey("AZSvvASdYtgMsDWjrRNbf58BXiA4cMhWLfDpTSieSzoN"),
                    lamports: amount * 1000000000,
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            localStorage.setItem('txnSignature', signature);
            setSign(signature);
            toast.success("Transaction successful");
        } catch (error) {
            toast.error("Transaction failed: " + error.message);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
        const selectedFiles = Array.from(e.target.files);
        setDFiles(selectedFiles.map(file => URL.createObjectURL(file)));
    };

    return (
        <>
            {loader ? (
                <div className="flex flex-col gap-2 items-center justify-center relative" style={{ height: `${wHeight}px` }}>
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
                    <img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28 absolute top-2/4 left-2/4 transform -translate-x-1/2 -translate-y-1/2" />
                    <h1 className=' text-lg font-semibold text-orange-500 bg-green-300'>Working On It, Please Wait!</h1>
                </div>
            ) : (
                <div className='mb-[1vh] p-0 px-[5vw] rounded-md bg-transparent justify-center flex' style={{ height: wHeight }}>
                    <div className='h-[78vh] items-center px-[2vw] w-full transition-all duration-200 rounded-lg text-center flex flex-col border justify-center bg-transparent bg-opacity-5  backdrop-filter backdrop-blur-lg shadow-[4px_4px_12px_0px_black]'>
                        <div className='mb-1 justify-center flex'>
                            <input className=' cursor-pointer justify-center flex border-dashed border-[1px] p-2 bg-black rounded-lg border-white text-white text-sm font-extralight' type="file" multiple onChange={handleFileChange} />
                        </div>

                        <div className='upload-image '>
                            {dfiles?.map((src, index) => (
                                <div key={index} className="image-container cursor-pointer" ref={el => (tiltRef.current[index] = el)}>
                                    <img className="uploaded-image" src={src} alt="Selected file" />
                                </div>
                            ))}
                        </div>

                        <div className='m-1 w-full'>
                            <input className='w-full bg-black text-white font-light py-2 px-4 rounded-md outline-none border-[1px] border-dashed text-sm' type="text" placeholder='Type Your Question Here...' onChange={(e) => { setText(e.target.value) }} />
                        </div>

                        <div className=''>
                            {sign ? (
                                <button onClick={handleSubmit} className="cursor-pointer hover:bg-white hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white">Upload</button>
                            ) : (
                                <button onClick={pay} className="m-1 bg-black px-16 py-3 text-white transition-all duration-200 hover:font-bold hover:textsm text-xs rounded-[50px] border font-light hover:shadow-[2px_2px_5px_rgba(0,0,0,0.5)]">Pay 0.5 SOL</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
