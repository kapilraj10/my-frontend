import React from "react";
import { Menu, Layout } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  FundProjectionScreenOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function SidebarNav({ active, onChange }) {
  return (
    <Sider
      width={240} // Sidebar width
      collapsible // Allow collapsing
      breakpoint="lg" // Collapse at large screens
      className="h-screen shadow bg-white dark:bg-gray-800" // Tailwind for height, shadow, bg
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center text-xl font-semibold tracking-wide border-b dark:border-gray-700">
        Kapil
      </div>

      {/* Menu Items */}
      <Menu
        mode="inline" // vertical menu
        selectedKeys={[active]} // highlight active menu
        onClick={(info) => onChange(info.key)} // handle click
        className="bg-white dark:bg-gray-800 border-none" // remove default AntD border
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "clients",
            icon: <ProjectOutlined />,
            label: "Clients",
          },
          {
            key: "projects",
            icon: <ProjectOutlined />,
            label: "Project Reporting",
          },
          {
            key: "finance",
            icon: <FundProjectionScreenOutlined />,
            label: "Financial Analytics",
          },
          {
            key: "tasks",
            icon: <DeploymentUnitOutlined />,
            label: "Task Tracking",
          },
          {
            key: "team",
            icon: <DeploymentUnitOutlined />,
            label: "Team",
          },
        ]}
      />
    </Sider>
  );
}
