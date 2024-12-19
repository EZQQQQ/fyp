// frontend/src/layout/DefaultLayout.js

import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/KnowledgeNode/Sidebar';

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark h-screen flex">
      {/* ===== Sidebar Start ===== */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* ===== Sidebar End ===== */}

      {/* ===== Content Area Start ===== */}
      <div className="relative flex flex-1 flex-col">
        <div className="sticky top-0 z-50">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="flex-1 overflow-y-auto pt-0">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
      {/* ===== Content Area End ===== */}
    </div>
  );
};

export default DefaultLayout;
