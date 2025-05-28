import React from 'react';

const Footer = () => {
  return (
    <footer className='w-full bg-red-600 text-white'>
      <div className='max-w-7xl p-6 mx-auto'>
        <div className='flex flex-wrap justify-evenly gap-4'>
          <div>
            <div className="text-xl font-bold">Logo</div>
            <p>Feito pelo ricardao.</p>
          </div>
          <div>a</div>
          <div>a</div>
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
