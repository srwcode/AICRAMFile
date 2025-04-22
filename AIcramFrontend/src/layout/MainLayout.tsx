import React, {  ReactNode } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {

  return (
    <div>
      <div className="flex h-screen">

        <div className="relative flex flex-1 flex-col">

          <main>
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
