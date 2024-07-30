"use client";
import Navbar from '@/app/components/Navbar';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function UserTask({ params }) {
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/user/task?id=${params.id}`, {
                    method: "GET",
                    credentials: 'include'
                });
                const result = await res.json();

                if (!result.success) {
                    toast.error(result.message);
                    return;
                }

                const val = result.data.image_url.map(imgObj => ({
                    ...imgObj,
                    url: imgObj.url.replace(
                        "https://aws-cloud-front-error.s3.ap-south-1.amazonaws.com",
                        `https://${process.env.NEXT_PUBLIC_CDN}.cloudfront.net`
                    )
                }));

                const chartData = val.map((imgObj, index) => ({
                    name: (index + 1).toString(),
                    counts: imgObj.noOfClick || 0,
                    url: imgObj.url
                }));

                setData(val);
                setChartData(chartData);
            } catch (err) {
                toast.error(err.message);
            }
        };

        fetchData();
    }, [params.id]);

    const wHeight = window.innerHeight * 0.89;

    return (
        <>
            <Navbar />
            <div className='mt-[10px] rounded-md overflow-y-auto overflow-x-hidden bg-orange-400' style={{ height: wHeight }}>
                <div className='gap-1 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:mx-[150px] my-3'>
                    {data?.map((imgObj, index) => (
                        <div key={index} className='flex flex-col justify-center items-center'>
                            <img className="rounded-sm lg:rounded-md m-2 h-[220px] w-[230px] lg:h-[250px] lg:w-[250px] mx-auto" src={imgObj.url} alt="image description" />
                            <h1>{index + 1}</h1>
                        </div>
                    ))}
                </div>
                <div className='w-full lg:w-1/3 mx-auto mt-[40px] h-[320px]'>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
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
        </>
    );
}
