// frontend/src/components/Header/Header.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import SearchBar from '../Search/Searchbar';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import DarkModeSwitcher from './DarkModeSwitcher';

import LogoLight from '../../assets/logo-downsized.png';
import LogoDark from '../../assets/logo-downsized-dark.png';

import { selectUser } from '../../features/userSlice';

const Header = (props) => {
  // Receive sidebarOpen and setSidebarOpen for toggling on mobile, as well as dark mode props.
  const { sidebarOpen, setSidebarOpen, darkMode, setDarkMode } = props;
  const user = useSelector(selectUser);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setTheme(isDarkMode ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    // On large screens, offset the header to the right so it doesn’t appear behind the sidebar.
    <header className="fixed top-0 left-0 right-0 lg:left-72 z-50 bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex items-center justify-between px-4 py-2 shadow-2 md:px-6 2xl:px-11">
        {/* Left side: Hamburger Toggle + Mobile Logo */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen && setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!w-full delay-300'
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && 'delay-400 !w-full'
                    }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!w-full delay-500'
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                ></span>
                <span
                  className={`absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black delay-400 duration-200 ease-in-out dark:bg-white ${!sidebarOpen && '!h-0 !delay-200'
                    }`}
                ></span>
              </span>
            </span>
          </button>

          {/* Mobile Logo */}
          <Link className="block flex-shrink-0 lg:hidden" to="/">
            <img
              src={theme === 'dark' ? LogoDark : LogoLight}
              alt="Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Center: Search Bar */}
        {user && (
          <div>
            <SearchBar />
          </div>
        )}

        {/* Right side: Dark Mode Switch, Notification, User Menu */}
        {user && (
          <div className="flex items-center gap-3 2xsm:gap-7">
            <ul className="flex items-center gap-2 2xsm:gap-4">
              <DarkModeSwitcher />
              <DropdownNotification />
            </ul>
            <DropdownUser user={user} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
