"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Hero1() {
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

    const getTasks = async () => {
        const res = await fetch('/api/worker', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
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
    };

    useEffect(() => {
        getTasks();
    }, []);

    const markTask = async () => {
       if(selectedImageID){
            const res = await fetch(`/api/worker/task?id=${selectedImageID}`,{
                method:"PUT",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })
       }
       else{
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
                                    <span>{src._id}</span>
                                    <img
                                        className={`rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto ${selectedImage === imgIndex ? 'border-4 border-black' : ''}`}
                                        // src={src.url}
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
                                    Earn {Number(currentTask.amount.$numberDecimal) / (1000000000 * currentTask.noOfSuggestionsWant)} sol
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
