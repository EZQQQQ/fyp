// frontend/src/components/KnowledgeNode/SidebarLink.js
import React from "react";
import { NavLink } from "react-router-dom";

const getNavLinkClasses = (isActive) =>
  `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive
    ? "bg-graydark dark:bg-meta-4 active"
    : "false"
  }`;

function SidebarLink({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => getNavLinkClasses(isActive)}
    >
      {Icon && <Icon className="mr-2" />}
      <span className="font-medium">{children}</span>
    </NavLink>
  );
}

export default SidebarLink;