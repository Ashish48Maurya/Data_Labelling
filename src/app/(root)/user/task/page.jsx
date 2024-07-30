'use client';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/task', {
          method: "GET",
          credentials: "include"
        });
        const res = await response.json();

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        console.log(res.data);
        setData(res.data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <h1>List All Tasks of User</h1>
      <table>
        <tbody>
          {data?.map((obj, index) => (
            <tr key={index}>
             <Link href={`/user/task/${obj._id}`}> <td>{obj.title}</td> </Link>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
