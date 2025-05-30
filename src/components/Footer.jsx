import React from 'react';

const Footer = () => {
  return (
    <footer className='w-full bg-red-600 text-white'>
      <div className='max-w-7xl p-6 mx-auto'>
        <div className='flex flex-wrap ml-4 justify-between gap-4'>
          <div>
            <div className="text-xl font-bold mb-2"><a href=""><img src="/public/img/logo-site.png" alt="" className='h-20' /></a></div>
            <p>Feito pelo ricardao.</p>
          </div>
          <div>
            <h5 className='font-bold'>Pages</h5>
            <ul>
              <li><a href="/login" className='hover:text-black'>Login</a></li>
              <li><a href="/cadastro" className='hover:text-black'>Cadastro</a></li>
              <li><a href="/racas" className='hover:text-black'>Racas</a></li>
              <li><a href="/classes" className='hover:text-black'>Classes</a></li>
              <li><a href="/criacao" className='hover:text-black'>Criação de Personagens</a></li>
            </ul>
          </div>
          <div></div>
        </div>
        <hr className='h-px my-6 bg-white' />
        <div className='text-center'>
          <p>© 2025 Site-rpg. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
