import React, { useState, useEffect } from "react";
import { Button, Switch } from "antd";
import { ReloadOutlined, BulbOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";

const DashboardHeader = () => {
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(false);

  // Function to refetch all related queries
  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
      queryClient.invalidateQueries({ queryKey: ["finance"] }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
      queryClient.invalidateQueries({ queryKey: ["team"] }),
    ]);
  };

  // Toggle dark mode on <html> root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-3 shadow-md">
      {/* Left Section: Refresh Button */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold dark:text-white">Dashboard</h2>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={refetchAll}
          className="font-medium"
        >
          Refresh All
        </Button>
      </div>

      {/* Right Section: Dark Mode Toggle */}
      <div className="flex items-center gap-2">
        <BulbOutlined className="text-lg text-yellow-500 dark:text-yellow-300" />
        <Switch
          checked={darkMode}
          onChange={setDarkMode}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </div>
    </header>
  );
};

export default DashboardHeader;
