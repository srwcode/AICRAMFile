import { Link } from 'react-router-dom';
import { 
  Users, 
  Grid3x3, 
  Building, 
  FileChartColumn, 
  TextSearch,
  CloudUpload,
  ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 pb-8 mb-10 mt-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Area</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        <Link to="/admin/users" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Users</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage users</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>

        <Link to="/admin/assessments" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                <TextSearch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Assessments</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage assessments</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>

        <Link to="/admin/results" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
                <FileChartColumn className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Results</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage results</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>

        <Link to="/admin/organizations" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Organizations</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage organizations</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>

        <Link to="/admin/matrices" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <Grid3x3 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Matrices</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage matrices</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>

        <Link to="/admin/files" className="group rounded-lg bg-white dark:bg-boxdark p-4 shadow transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-teal-100 dark:bg-teal-900/20 p-3">
                <CloudUpload className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">Files</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage uploaded files</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;