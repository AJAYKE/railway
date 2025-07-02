import { Train } from "lucide-react";

interface DashboardHeaderProps {
  projectCount: number;
}

export const DashboardHeader = ({ projectCount }: DashboardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Train className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Railway Container Management
        </h1>
      </div>
      <p className="text-gray-600">
        Manage your Railway projects and services • {projectCount} project
        {projectCount !== 1 ? "s" : ""} found
      </p>
    </div>
  );
};
