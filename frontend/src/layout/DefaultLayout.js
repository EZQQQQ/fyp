// frontend/src/layout/DefaultLayout.js

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Sidebar from '../components/KnowledgeNode/Sidebar';

const DefaultLayout = ({
  darkMode,
  setDarkMode,
  user,
  openCreateCommunityModal
}) => {
  // Declare sidebar state here.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-screen flex">
      {/* Sidebar is fixed on the left */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        openCreateCommunityModal={openCreateCommunityModal}
      />

      {/* Main content area with left margin on large screens */}
      <div className="relative flex flex-1 flex-col lg:ml-72">
        {/* Pass sidebar state to the header as well */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main scrollable container (top padding offsets the fixed header) */}
        <main className="flex-1 overflow-y-auto pt-14 main-scroll">
          <div className="mx-auto max-w-screen-2xl p-2 md:p-3 2xl:p-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
