"use client";
import Sidebar from "@/app/Components/Sidebar/Sidebar";
import { useUserContext } from "@/context/userContext";
import React from "react";

function SidebarProvider() {
  const userId = useUserContext().user._id;
  console.log("hello",userId)
  return <>{userId && <Sidebar />}</>;
}

export default SidebarProvider;
