import Hero from '@/app/components/Hero'
import Navbar from '@/app/components/Navbar'
import React from 'react'

export default function Page() {
  return (
    <div
    style={{
      backgroundColor: '#8EC5FC',
      backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
  }}
    >
      <Navbar />
      <Hero />
    </div>
  )
}
