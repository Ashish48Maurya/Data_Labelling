"use client"
import React, { useState } from 'react'
import toast from 'react-hot-toast';

export default function Hero() {
    const wHeight = window.innerHeight * 0.89;
    const [files, setFiles] = useState([]);
    const [text,setText] = useState();
    const uploadedFileUrls = [];
    const [loader, setLoader] = useState(false);

    // const saveTask = async()=>{
    //     const res = await fetch('/api/user/task',{
    //         method: "POST",
    //         headers:{
    //             'Content-Type': "application/json"
    //         },
    //         body: JSON.stringify({
    //             uploadedFileUrls,
    //             text
    //         })
    //     })
    //     const ans = res.json();
    //     console.log(ans);
    // }


    // const handleSubmit = async () => {
    //     if (files.length === 0) {
    //         toast.error('No files selected');
    //         return;
    //     }
    //     try {
    //         setLoader(true);
    //         const presignedUrlResponse = await fetch('/api/user');
    //         const { data: presignedUrl } = await presignedUrlResponse.json();
    //         for (let i = 0; i < files.length; i++) {
    //             const file = files[i];
    //             const response = await fetch(presignedUrl, {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Content-Type': file.type
    //                 },
    //                 body: file
    //             });

    //             if (response.ok) {
    //                 toast.success(`File ${file.name} uploaded successfully`);
    //                 uploadedFileUrls.push(presignedUrl.split('?')[0]);
    //                 await saveTask();
    //             } else {
    //                 toast.error(`Upload failed for ${file.name}:`, response.statusText);
    //             }
    //         }
    //         setLoader(false);
    //         // console.log(uploadedFileUrls);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };

    const pay=async()=>{
        console.log("Payable");
    }


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
                        <input className=' bg-black text-white font-semibold p-2 rounded-md outline-none' type="text" placeholder='Type Your Question Here...' onChange={(e)=>{setText(e.target.value)}}/>
                    </div>
                    <div className='mt-[15px]  w-fit mx-auto' >
                        <input className='p-1 bg-black rounded-lg border-black text-white' type="file" multiple onChange={(e) => { setFiles(e.target.files) }} />
                    </div>
                    <div className=' gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-3'>
                        <img class=" rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="404.png" alt="image description" />
                        <img class=" rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="404.png" alt="image description" />
                        <img class=" rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="404.png" alt="image description" />
                        <img class=" rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="404.png" alt="image description" />
                    </div>
                    <div className='w-max mx-auto mb-[5px]'>
                        {/* <button onClick={handleSubmit} className=" cursor-pointer hover:bg-white hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white">Upload</button> */}
                        <button onClick={pay} className=" cursor-pointer hover:bg-white hover:text-black rounded-md bg-black mt-[10px] p-[10px] text-white">Upload</button>
                    </div>
                </div>
            }
        </>
    )
}


