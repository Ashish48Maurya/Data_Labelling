"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './context';
import VanillaTilt from 'vanilla-tilt';

export default function Hero1() {
    const { setAmt } = useAuth();
    const [wHeight, setWHeight] = useState(0); // Use state to store window height
    const [tasks, setTasks] = useState([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const { publicKey } = useWallet();
    const token = localStorage.getItem('token');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageID, setSelectedImageID] = useState(null);
    const currentTask = tasks[currentTaskIndex];
    const tiltRef = useRef([]);

    const handleImageClick = (id, imgIndex) => {
        setSelectedImageID(id);
        setSelectedImage(imgIndex);
    };

    useEffect(() => {
        // Set window height only on the client side
        if (typeof window !== 'undefined') {
            setWHeight(window.innerHeight * 0.89);
        }
    }, []);

    useEffect(() => {
        VanillaTilt.init(tiltRef.current, {
            max: 10,
            speed: 1000,
            glare: true,
            "max-glare": 0.8,
        });
    }, [tasks]);

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
        <div className='mb-[1vh] p-0 px-[5vw] rounded-md bg-transparent justify-center flex' style={{ height: wHeight }}>
            {tasks.length > 0 && currentTask ? (
                <>
                    <div className='flex flex-col justify-center'>
                        <div className='border h-[78vh] items-center px-[2vw] transition-all duration-200 rounded-lg text-center flex flex-col justify-center bg-transparent bg-opacity-5  backdrop-filter backdrop-blur-2xl shadow-[4px_4px_12px_0px_black] text-3xl font-bold'>
                            <div className='border w-full bg-black text-white font-light py-2 px-4 rounded-md outline-none border-dashed text-sm'>
                                {currentTask.title}
                            </div>
                            <div className='upload-image'>
                                {currentTask.image_url.map((src, imgIndex) => (
                                    <div key={imgIndex} className='cursor-pointer image-container transition-all duration-200'>
                                        <img
                                            ref={el => tiltRef.current[imgIndex] = el}
                                            className={`uploaded-image ${selectedImage === imgIndex ? '' : ''}`}
                                            src={src.url}
                                            alt={`Image ${imgIndex + 1}`}
                                            onClick={() => handleImageClick(src._id, imgIndex)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='text-center'>
    {publicKey && (
        <button
            className='m-1 cursor-pointer bg-black px-16 py-3 text-white transition-all duration-200 hover:font-bold text-xs rounded-[50px] border font-light hover:shadow-[2px_2px_5px_rgba(0,0,0,0.5)]'
            onClick={() => {
                console.log('Button clicked');
                console.log('selectedImageID:', selectedImageID);
                console.log('publicKey:', publicKey);
                markTask();
            }}
        >
            Earn {parseFloat(currentTask.amount.$numberDecimal) / currentTask.noOfSuggestionsWant} sol
        </button>
    )}
</div>


                        </div>
                        <div className='flex justify-between mx-[2vw] w-[90vw] relative bottom-[5.5rem]'>
                            <button className='m-1 cursor-pointer bg-black px-16 py-3 text-white transition-all duration-200 hover:font-bold text-xs rounded-[50px] border font-light hover:shadow-[2px_2px_5px_rgba(0,0,0,0.5)]' onClick={handlePrevious} disabled={currentTaskIndex === 0}>Previous</button>
                            <button className='m-1 cursor-pointer bg-black px-16 py-3 text-white transition-all duration-200 hover:font-bold text-xs rounded-[50px] border font-light hover:shadow-[2px_2px_5px_rgba(0,0,0,0.5)]' onClick={handleNext} disabled={currentTaskIndex === tasks.length - 1}>Next</button>
                        </div>
                    </div>
                </>
            ) : (
                <h1 className='h-[78vh] items-center px-[2vw] w-full transition-all duration-200 rounded-lg text-center flex flex-col border justify-center bg-transparent bg-opacity-5  backdrop-filter backdrop-blur-2xl shadow-[4px_4px_12px_0px_black] text-3xl font-bold '>No Tasks Found</h1>
            )}
        </div>
    );
}





























// ------ YEH WALA ORIGINAL CODE HAI





// "use client";
// import { useWallet } from '@solana/wallet-adapter-react';
// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useAuth } from './context';

// export default function Hero1() {
//     const { setAmt } = useAuth();
//     const wHeight = window.innerHeight * 0.89;
//     const [tasks, setTasks] = useState([]);
//     const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
//     const { publicKey } = useWallet();
//     const token = localStorage.getItem('token');
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [selectedImageID, setSelectedImageID] = useState(null);
//     const currentTask = tasks[currentTaskIndex];

//     const handleImageClick = (id, imgIndex) => {
//         setSelectedImageID(id);
//         setSelectedImage(imgIndex);
//     };

//     const getUser = async () => {
//         const res = await fetch('/api/worker', {
//             method: "GET",
//             credentials: 'include',
//         });
//         const data = await res.json();
//         if (!data.success) {
//             toast.error(data.message);
//         }
//         else {
//             console.log(data.data);
//             // setAmt(parseFloat(data?.data?.pending_amt?.$numberDecimal));
//             // setAmt(data?.data.pending_amt);
//             setAmt(data?.data?.pending_amt);
//         }
//     }

//     const getTasks = async () => {
//         try {
//             const res = await fetch('/api/worker/task', {
//                 method: 'GET',
//                 credentials: 'include',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });
    
//             const data = await res.json();
    
//             if (!data.success) {
//                 toast.error(data.message);
//             } else {
//                 const updatedUrls = data.data.map(task => ({
//                     ...task,
//                     image_url: task.image_url.map(imgObj => ({
//                         ...imgObj,
//                         url: imgObj.url.replace(
//                             "https://aws-cloud-front-error.s3.ap-south-1.amazonaws.com",
//                             `https://${process.env.NEXT_PUBLIC_CDN}.cloudfront.net`
//                         )
//                     }))
//                 }));
//                 setTasks(updatedUrls);
//             }
//         } catch (error) {
//             console.error('Failed to fetch tasks:', error);
//             toast.error('An error occurred while fetching tasks.');
//         }
//     };
    

//     useEffect(() => {
//         getTasks();
//         getUser();
//     }, []);

//     const markTask = async () => {
//         if (selectedImageID) {
//             const res = await fetch(`/api/worker/task?id=${selectedImageID}`, {
//                 method: "PUT",
//                 credentials: 'include',
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             })
//             const data = await res.json();
//             if (!data.success) {
//                 toast.error(data.message);
//             }
//             else {
//                 setAmt(data.data);
//                 toast.success(data.message)
//                 setCurrentTaskIndex(currentTaskIndex + 1);
//                 setSelectedImageID(null);
//                 setSelectedImage(null);
//             }
//         }
//         else {
//             toast.error("Select One Option First");
//         }
//     };

//     const handleNext = () => {
//         if (currentTaskIndex < tasks.length - 1) {
//             setCurrentTaskIndex(currentTaskIndex + 1);
//             setSelectedImage(null);
//         }
//     };

//     const handlePrevious = () => {
//         if (currentTaskIndex > 0) {
//             setCurrentTaskIndex(currentTaskIndex - 1);
//             setSelectedImage(null);
//         }
//     };

//     return (
//         <div className='mt-[10px] rounded-md bg-orange-400 overflow-y-auto overflow-x-hidden' style={{ height: wHeight }}>
//             {tasks.length > 0 && currentTask ? (
//                 <>
//                     <div>
//                         <div className='sm:text-sm lg:text-xl font-semibold text-black text-center mt-[100px]'>
//                             {currentTask.title}
//                         </div>
//                         <div className='gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-5'>
//                             {currentTask.image_url.map((src, imgIndex) => (
//                                 <div key={imgIndex} className='flex flex-col gap-1'>
//                                     <img
//                                         className={`rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto ${selectedImage === imgIndex ? 'border-4 border-black' : ''}`}
//                                         src={src.url}
//                                         alt={`Image ${imgIndex + 1}`}
//                                         onClick={() => handleImageClick(src._id, imgIndex)}
//                                     />
//                                     <span className='text-center text-xl lg:text-2xl font-extrabold'>{imgIndex + 1}</span>
//                                 </div>
//                             ))}

//                         </div>
//                         <div className='text-center'>
//                             {publicKey && (
//                                 <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={markTask}>
//                                     Earn {parseFloat(currentTask.amount.$numberDecimal) / currentTask.noOfSuggestionsWant} sol
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                     <div className='flex justify-between mt-7 lg:mx-[150px]'>
//                         <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={handlePrevious} disabled={currentTaskIndex === 0}>Previous</button>
//                         <button className='bg-black p-[10px] text-white font-semibold rounded-md' onClick={handleNext} disabled={currentTaskIndex === tasks.length - 1}>Next</button>
//                     </div>
//                 </>
//             ) : (
//                 <h1>No Tasks Found</h1>
//             )}
//         </div>
//     );
// }
