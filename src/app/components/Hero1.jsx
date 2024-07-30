"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './context';

export default function Hero1() {
    const { setAmt } = useAuth();
    const wHeight = window.innerHeight * 0.89;
    const [tasks, setTasks] = useState([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const { publicKey } = useWallet();
    const token = localStorage.getItem('token');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageID, setSelectedImageID] = useState(null);
    const currentTask = tasks[currentTaskIndex];

    const handleImageClick = (id, imgIndex) => {
        setSelectedImageID(id);
        setSelectedImage(imgIndex);
    };

    const getUser = async () => {
        const res = await fetch('/api/worker', {
            method: "GET",
            credentials: 'include',
        });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.message);
        }
        else {
            console.log(data.data);
            // setAmt(parseFloat(data?.data?.pending_amt?.$numberDecimal));
            // setAmt(data?.data.pending_amt);
            setAmt(data?.data?.pending_amt);
        }
    }

    const getTasks = async () => {
        try {
            const res = await fetch('/api/worker/task', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const data = await res.json();
    
            if (!data.success) {
                toast.error(data.message);
            } else {
                const updatedUrls = data.data.map(task => ({
                    ...task,
                    image_url: task.image_url.map(imgObj => ({
                        ...imgObj,
                        url: imgObj.url.replace(
                            "https://aws-cloud-front-error.s3.ap-south-1.amazonaws.com",
                            `https://${process.env.NEXT_PUBLIC_CDN}.cloudfront.net`
                        )
                    }))
                }));
                setTasks(updatedUrls);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('An error occurred while fetching tasks.');
        }
    };
    

    useEffect(() => {
        getTasks();
        getUser();
    }, []);

    const markTask = async () => {
        if (selectedImageID) {
            const res = await fetch(`/api/worker/task?id=${selectedImageID}`, {
                method: "PUT",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message);
            }
            else {
                setAmt(data.data);
                toast.success(data.message)
                setCurrentTaskIndex(currentTaskIndex + 1);
                setSelectedImageID(null);
                setSelectedImage(null);
            }
        }
        else {
            toast.error("Select One Option First");
        }
    };

    const handleNext = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
            setSelectedImage(null);
        }
    };

    const handlePrevious = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(currentTaskIndex - 1);
            setSelectedImage(null);
        }
    };

    return (
        <div className='mt-[10px] rounded-md bg-orange-400 overflow-y-auto overflow-x-hidden' style={{ height: wHeight }}>
            {tasks.length > 0 && currentTask ? (
                <>
                    <div>
                        <div className='sm:text-sm lg:text-xl font-semibold text-black text-center mt-[100px]'>
                            {currentTask.title}
                        </div>
                        <div className='gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-5'>
                            {currentTask.image_url.map((src, imgIndex) => (
                                <div key={imgIndex} className='flex flex-col gap-1'>
                                    <img
                                        className={`rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto ${selectedImage === imgIndex ? 'border-4 border-black' : ''}`}
                                        src={src.url}
                                        alt={`Image ${imgIndex + 1}`}
                                        onClick={() => handleImageClick(src._id, imgIndex)}
                                    />
                                    <span className='text-center text-xl lg:text-2xl font-extrabold'>{imgIndex + 1}</span>
                                </div>
                            ))}

                        </div>
                        <div className='text-center'>
                            {publicKey && (
                                <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={markTask}>
                                    Earn {parseFloat(currentTask.amount.$numberDecimal) / currentTask.noOfSuggestionsWant} sol
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='flex justify-between mt-7 lg:mx-[150px]'>
                        <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={handlePrevious} disabled={currentTaskIndex === 0}>Previous</button>
                        <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={handleNext} disabled={currentTaskIndex === tasks.length - 1}>Next</button>
                    </div>
                </>
            ) : (
                <h1>No Tasks Found</h1>
            )}
        </div>
    );
}
