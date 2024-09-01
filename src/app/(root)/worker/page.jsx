import Hero1 from '@/app/components/Hero1'
import Navbar from '@/app/components/Navbar'
import React from 'react'

export default function page() {
  return (
    <div
    style={{
      backgroundColor: '#8EC5FC',
      backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
  }}
    >
      <Navbar />
      <Hero1 />
    </div>
  )
}
