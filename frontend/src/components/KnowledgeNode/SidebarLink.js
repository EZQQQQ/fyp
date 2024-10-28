// /frontend/src/components/KnowledgeNode/SidebarLink.js

import React from "react";
import { NavLink } from "react-router-dom";

function SidebarLink({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${
          isActive
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            : "text-gray-700 dark:text-gray-200"
        }`
      }
    >
      {Icon && <Icon className="mr-2" />}
      <span className="font-medium">{children}</span>
    </NavLink>
  );
}

export default SidebarLink;
