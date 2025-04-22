import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Organization {
  organization_id: string;
  user_id: string;
  name: string;
  status: 1 | 2;
  industry: string;
}

interface PaginatedResponse {
  total_count: number;
  organization_items: Organization[];
}

const OrganizationIndex = () => {
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [loadingUsernames, setLoadingUsernames] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const recordsPerPage = 10;

  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/organizations?page=${currentPage}&recordPerPage=${recordsPerPage}&startIndex=${(currentPage - 1) * recordsPerPage}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setOrganizations([]);
          setTotalCount(0);
          return;
        }
  
        const data: PaginatedResponse = await response.json();
        setOrganizations(data.organization_items || []);
        setTotalCount(data.total_count || 0);
      } catch (err) {
        setOrganizations([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [currentPage]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const userIds = organizations.map(organization => organization.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      
      const newLoadingStates: { [key: string]: boolean } = {};
      const newUsernames: { [key: string]: string } = { ...usernames };
      
      uniqueUserIds.forEach(userId => {
        newLoadingStates[userId] = true;
      });
      setLoadingUsernames(newLoadingStates);

      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const response = await fetch(`${config.API_URL}/users/username?user_id=${userId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'token': token || ''
                }
              });

              if (!response.ok) {
                throw new Error('Failed to fetch username');
              }

              const data = await response.json();
              newUsernames[userId] = data.username;
            } catch (error) {
              console.error(`Error fetching username for user ${userId}:`, error);
              newUsernames[userId] = 'Unknown User';
            } finally {
              newLoadingStates[userId] = false;
            }
          })
        );

        setUsernames(newUsernames);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      } finally {
        setLoadingUsernames(newLoadingStates);
      }
    };

    if (organizations.length > 0) {
      fetchUsernames();
    }
  }, [organizations]);

  const handleDelete = async (organizationId: string) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/organizations/${organizationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete organization');

      toast.success('Organization deleted successfully');
      setOrganizations(organizations.filter(organization => organization.organization_id !== organizationId));
      
      if (organizations.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    }
  };

  const totalPages = Math.ceil(totalCount / recordsPerPage);

  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-6 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="hidden md:block px-4 py-1.5">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-6 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-10 shadow-default sm:px-7.5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations ({totalCount})</h1>
        <button
          onClick={() => navigate('/admin/organizations/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left">
              <th className="min-w-[120px] py-4 px-4 font-medium text-black pl-6">Name</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">User</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Status</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Industry</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
          {organizations.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-20 text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            organizations.map(organization => (
              <tr key={organization.organization_id} className="hover:bg-gray-50">
                <td className="border-b border-[#eee] py-5 px-4 pl-6">{organization.name}</td>
                <td className="border-b border-[#eee] py-5 px-4 pl-6">
                  {loadingUsernames[organization.user_id] ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <a className="text-blue-500 hover:underline" href={`/admin/users/${organization.user_id}`}>
                      {usernames[organization.user_id] || "Unknown User"}
                    </a>
                  )}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  {organization.status === 1 ? (
                    <span className="bg-green-500 text-white py-1.5 px-3 rounded-full text-sm">Active</span>
                  ) : organization.status === 2 ? (
                    <span className="bg-red-500 text-white py-1.5 px-3 rounded-full text-sm">Inactive</span>
                  ) : null}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">{organization.industry}</td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/organizations/${organization.organization_id}`)}
                      className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/organizations/${organization.organization_id}/edit`)}
                      className="bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(organization.organization_id)}
                      className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {organizations.length !== 0 && (
        <>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default OrganizationIndex;