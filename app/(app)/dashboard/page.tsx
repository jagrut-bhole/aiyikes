"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status, } = useSession();

  return (
    <div className="bg-[#151515] min-h-screen">
      <h1 className="text-white">Dashboard</h1>
      <p className="text-white">{session?.user?.name}</p>
      <p className="text-white">{session?.user?.email}</p>
    </div>
  )

}