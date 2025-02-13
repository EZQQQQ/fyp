// frontend/src/layout/DefaultLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Sidebar from '../components/KnowledgeNode/Sidebar';

const DefaultLayout = ({ darkMode, setDarkMode, user, openCreateCommunityModal }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark h-screen flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        openCreateCommunityModal={openCreateCommunityModal}
      />

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col lg:ml-72 transition-all duration-300">
        {/* Header (sticky) */}
        <div className="sticky top-0 z-50">
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Main Content – this is the only vertical scrolling container */}
        <main className="flex-1 overflow-y-auto pt-0">
          <div className="mx-auto max-w-screen-2xl p-2 md:p-3 2xl:p-8">
            <Outlet /> {/* Child routes will render here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
