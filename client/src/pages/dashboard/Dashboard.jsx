import React from "react";
import "./dashboard.scss";
import Sidebar from "../../components/Sidebar";
import AdminTopbar from "../../components/AdminTopbar";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="navigation">
        <Sidebar />
        <AdminTopbar />
      </div>
    </div>
  );
};

export default Dashboard;
