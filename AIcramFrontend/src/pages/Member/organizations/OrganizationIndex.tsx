import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Organization {
  organization_id: string;
  name: string;
  industry: string;
}

interface Assessment {
  assessment_id: string;
  organization_id: string;
}

interface PaginatedResponse {
  total_count: number;
  organization_items: Organization[];
}

const OrganizationIndex = () => {
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [assessmentsCountMap, setAssessmentsCountMap] = useState<Record<string, number>>({});
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

  React.useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/assessments?recordPerPage=9999`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
  
        if (!response.ok) return;
  
        const data = await response.json();
  
        const map: Record<string, number> = {};
  
        data.assessment_items.forEach((assessment: Assessment) => {
          if (assessment.assessment_id && assessment.organization_id) {
            map[assessment.organization_id] = (map[assessment.organization_id] || 0) + 1;
          }
        });
  
        setAssessmentsCountMap(map);
      } catch (err) {
        console.error('Error fetching assessments:', err);
      }
    };
  
    if (organizations.length > 0) {
      fetchAssessments();
    }
  }, [organizations.length]);

  const handleDelete = async (organizationId: string) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/organizations/remove/${organizationId}`, {
        method: 'POST',
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
      toast.error('Failed to delete organization');
    }
  };

  const totalPages = Math.ceil(totalCount / recordsPerPage);

  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-6 py-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>

        <span className="text-gray-300 px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-6 py-2 rounded-md border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg">
      <div className="animate-pulse flex space-x-2">
        <div className="h-3 w-3 bg-white rounded-full"></div>
        <div className="h-3 w-3 bg-white rounded-full"></div>
        <div className="h-3 w-3 bg-white rounded-full"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
      Error: {error}
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Organizations</h1>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm">Total: </span>
            <span className="ml-1 bg-gray-900 text-white text-sm px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/organizations/create')}
          className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Organization</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Name</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Industry</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Assessments</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
          {organizations.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-16 text-gray-400">
                <p>No organizations found</p>
              </td>
            </tr>
          ) : (
            organizations.map(organization => (
              <tr key={organization.organization_id} className="hover:bg-gray-900/50 transition-colors">
                <td className="py-4 px-6 text-white">{organization.name}</td>
                <td className="py-4 px-6 text-gray-300">{organization.industry}</td>
                <td className="py-4 px-6">
                  <span className="bg-gray-900 text-gray-300 text-sm px-2 py-1 rounded">
                    {assessmentsCountMap[organization.organization_id] || 0}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/member/organizations/${organization.organization_id}`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      View
                    </button>
                    {(assessmentsCountMap[organization.organization_id] || 0) === 0 && (
                    <>
                    <button
                      onClick={() => navigate(`/member/organizations/${organization.organization_id}/edit`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="Edit Organization"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(organization.organization_id)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-red-900/70 transition-colors"
                      title="Delete Organization"
                    >
                      Delete
                    </button>
                    </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {organizations.length > 0 && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default OrganizationIndex;