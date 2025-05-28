import { Button } from '@mui/material'
import React from 'react'
import Navbar from './Navbar'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className='flex justify-around p-6 bg-red-600'>
        <div className='mt-1'>
            Logo
        </div>
        <div></div>
        <div></div>
        <div>
            <Navbar />
        </div>
        <div className='flex gap-4'>
            <div>
                  <Link to={`/login`}><Button variant='contained' sx={{ backgroundColor: "darkgrey", color: "white" }}>Login</Button></Link>
            </div>
            <div>
                  <Link to={`/cadastro`}><Button variant='contained' sx={{ backgroundColor: "black" }}>Cadastrar</Button></Link>
            </div>
        </div>
    </header>
  )
}

export default Header