"use client"
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Transaction, SystemProgram, PublicKey, Connection as SolanaConnection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Hero() {
    const wHeight = window.innerHeight * 0.89;
    const [files, setFiles] = useState([]);
    const [dfiles, setDFiles] = useState([]);
    const [text, setText] = useState();
    const [loader, setLoader] = useState(false);
    const amount = process.env.NEXT_PUBLIC_AMT;
    const { publicKey, sendTransaction } = useWallet();
    const token = localStorage.getItem('token')
    const [sign,setSign] = useState(null)
    const uploadedFileUrls = [];

    const saveTask = async () => {
        const Signature = localStorage.getItem('txnSignature');
        console.log(Signature);
        console.log(uploadedFileUrls,
            text,
            amount,
            Signature);
        const res = await fetch('/api/user/task', {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uploadedFileUrls,
                text,
                amount,
                Signature: localStorage.getItem('txnSignature'),
            })
        })
        const ans = await res.json();
        if (!ans.success) {
            toast.error("Task Submission Failed, Please try Again");
            return;
        }
        else {
            toast.success("Task Submitted");
            localStorage.removeItem('txnSignature')
            setDFiles([]);
            setFiles([]);
        }
        console.log(ans);
    }


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
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
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
                    lamports: amount*1000000000,
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            localStorage.setItem('txnSignature', signature);
            setSign(signature)
            toast.success("Transaction successful");
        } catch (error) {
            toast.error("Transaction failed: " + error.message);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files)
        const selectedFiles = Array.from(e.target.files);
        setDFiles(selectedFiles.map(file => URL.createObjectURL(file)));
    };

    return (

        <>
            {
                loader == true ? <div class="flex flex-col gap-2 items-center justify-center relative" style={{ height: `${wHeight}px` }}>
                    <div class="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
                    <img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" class="rounded-full h-28 w-28 absolute top-2/4 left-2/4 transform -translate-x-1/2 -translate-y-1/2" />
                    <h1 className=' text-lg font-semibold text-orange-500'>Working On It, Please Wait!</h1>
                </div> :
                    <div className='mt-[10px] rounded-md bg-orange-400 overflow-y-auto overflow-x-hidden' style={{ height: wHeight }}>
                        <div className=' w-fit mx-auto mt-[15px] lg:mt-[150px]'>
                            <input className=' bg-black text-white font-semibold p-2 rounded-md outline-none' type="text" placeholder='Type Your Question Here...' onChange={(e) => { setText(e.target.value) }} />
                        </div>
                        <div className='mt-[15px]  w-fit mx-auto' >
                            <input className='p-1 bg-black rounded-lg border-black text-white' type="file" multiple onChange={handleFileChange}   /> 
                            {/* onChange={(e) => { setFiles(e.target.files) }} */} 
                            {/* onChange={handleFileChange} */}
                        </div>
                        <div className=' gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-3'>
                            {dfiles?.map((src, index) => (
                                <img key={index} className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto bg-cover" src={src} alt="Selected file" />
                            ))}
                        </div>
                        <div className='w-max mx-auto mb-[5px]'>
                            {
                                // localStorage.getItem('txnSignature') ?
                                sign ?
                                    <button onClick={handleSubmit} className=" cursor-pointer hover:bg-white hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white">Upload</button> :
                                    <button onClick={pay} className=" cursor-pointer hover:bg-white hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white">Pay 0.5 SOL</button>
                            }
                        </div>
                    </div>
            }
        </>
    )
}


