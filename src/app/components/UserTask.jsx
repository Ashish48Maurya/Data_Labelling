"use client"
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function UserTask() {
    const wHeight = window.innerHeight * 0.89;

    const data = [
        { name: '1st', counts: 4000 },
        { name: '2nd', counts: 300 },
        { name: '3rd', counts: 2000 },
        { name: '4th', counts: 2780 },
    ];

    return (
        <div className='mt-[10px] rounded-md overflow-y-auto overflow-x-hidden bg-orange-400' style={{ height: wHeight }}>
            <div className='gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-3'>
                <div className='flex flex-col justify-center items-center'>
                    <img className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="/404.png" alt="image description" />
                    <h1>(1st)</h1>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="/404.png" alt="image description" />
                    <h1>(2nd)</h1>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="/404.png" alt="image description" />
                    <h1>(3rd)</h1>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src="/404.png" alt="image description" />
                    <h1>(4th)</h1>
                </div>
               
            </div>
            <div  className='w-full lg:w-1/3 mx-auto mt-[40px] h-[320px]'>
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#000" />
                            <YAxis stroke="#000" />
                            <Tooltip contentStyle={{ backgroundColor: '#ccc', color: '#000', border: '1px solid #555' }} />
                            <Legend />
                            <Bar dataKey="counts" fill="#000" stroke="#264653" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
        </div>
    );
}
