"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {

  const router = useRouter();
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user.name || "User"}!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Here&apos;s your dashboard overview
              </p>
            </div>
          </div>
          <div className="justify-end">
            <Badge>
              {user?.role}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
              Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              120
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              34
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              $5,400
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
              Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              12
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Button
            size={'sm'}
            className="text-xs"
            onClick={() => router.push('/patients')}
          >
            Add New Patient
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
            Schedule Appointment
          </Button>
          <Button className="bg-purple-600 text-white hover:bg-purple-700 flex-1">
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
