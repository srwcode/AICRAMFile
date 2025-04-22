import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Assessment {
  assessment_id: string;
  user_id: string;
  name: string;
  status: 1 | 2;
  matrix_id: string;
  organization_id: string;
}

interface PaginatedResponse {
  total_count: number;
  assessment_items: Assessment[];
}

const AssessmentIndex = () => {
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [loadingUsernames, setLoadingUsernames] = useState<{ [key: string]: boolean }>({});
  const [matrices, setMatrices] = useState<{ [key: string]: string }>({});
  const [organizations, setOrganizations] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const recordsPerPage = 10;

  React.useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/assessments?page=${currentPage}&recordPerPage=${recordsPerPage}&startIndex=${(currentPage - 1) * recordsPerPage}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setAssessments([]);
          setTotalCount(0);
          return;
        }
  
        const data: PaginatedResponse = await response.json();
        setAssessments(data.assessment_items || []);
        setTotalCount(data.total_count || 0);
      } catch (err) {
        setAssessments([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [currentPage]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const userIds = assessments.map(assessment => assessment.user_id);
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

    if (assessments.length > 0) {
      fetchUsernames();
    }
  }, [assessments]);

  const handleDelete = async (assessmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete assessment');

      toast.success('Assessment deleted successfully');
      setAssessments(assessments.filter(assessment => assessment.assessment_id !== assessmentId));
      
      if (assessments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
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

  useEffect(() => {
    const fetchMatrices = async () => {
      const matrixIds = assessments.map(assessment => assessment.matrix_id);
      const uniqueMatrixIds = [...new Set(matrixIds)];
      
      const newLoadingStates: { [key: string]: boolean } = {};
      const newMatrices: { [key: string]: string } = { ...matrices };
      
      uniqueMatrixIds.forEach(matrixId => {
        newLoadingStates[matrixId] = true;
      });

      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          uniqueMatrixIds.map(async (matrixId) => {

            if(matrixId) {
              try {
                const response = await fetch(`${config.API_URL}/matrices/${matrixId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'token': token || ''
                  }
                });

                if (!response.ok) {
                  throw new Error('Failed to fetch matrix');
                }

                const data = await response.json();
                newMatrices[matrixId] = data.name;
              } catch (error) {
                console.error(`Error fetching:`, error);
                newMatrices[matrixId] = "";
              } finally {
                newLoadingStates[matrixId] = false;
              }
            }
          })
        );

        setMatrices(newMatrices);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    if (assessments.length > 0) {
      fetchMatrices();
    }
  }, [assessments]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const organizationIds = assessments.map(assessment => assessment.organization_id);
      const uniqueOrganizationIds = [...new Set(organizationIds)];
      
      const newLoadingStates: { [key: string]: boolean } = {};
      const newOrganizations: { [key: string]: string } = { ...organizations };
      
      uniqueOrganizationIds.forEach(organizationId => {
        newLoadingStates[organizationId] = true;
      });

      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          uniqueOrganizationIds.map(async (organizationId) => {

            if(organizationId) {
              try {
                const response = await fetch(`${config.API_URL}/organizations/${organizationId}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'token': token || ''
                  }
                });

                if (!response.ok) {
                  throw new Error('Failed to fetch organization');
                }

                const data = await response.json();
                newOrganizations[organizationId] = data.name;
              } catch (error) {
                console.error(`Error fetching:`, error);
                newOrganizations[organizationId] = "";
              } finally {
                newLoadingStates[organizationId] = false;
              }
            }
          })
        );

        setOrganizations(newOrganizations);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    if (assessments.length > 0) {
      fetchOrganizations();
    }
  }, [assessments]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-10 shadow-default sm:px-7.5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assessments ({totalCount})</h1>
        <button
          onClick={() => navigate('/admin/assessments/create')}
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
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Matrix</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Organization</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
          {assessments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-20 text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            assessments.map(assessment => (
              <tr key={assessment.assessment_id} className="hover:bg-gray-50">
                <td className="border-b border-[#eee] py-5 px-4 pl-6">{assessment.name}</td>
                <td className="border-b border-[#eee] py-5 px-4 pl-6">
                  {loadingUsernames[assessment.user_id] ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <a className="text-blue-500 hover:underline" href={`/admin/users/${assessment.user_id}`}>
                      {usernames[assessment.user_id] || "Unknown User"}
                    </a>
                  )}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  {assessment.status === 1 ? (
                    <span className="bg-green-500 text-white py-1.5 px-3 rounded-full text-sm">Active</span>
                  ) : assessment.status === 2 ? (
                    <span className="bg-red-500 text-white py-1.5 px-3 rounded-full text-sm">Inactive</span>
                  ) : null}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <a className="text-blue-500 hover:underline" href={`/admin/matrices/${assessment.matrix_id}`}>
                    {matrices[assessment.matrix_id]}
                  </a>
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <a className="text-blue-500 hover:underline" href={`/admin/organizations/${assessment.organization_id}`}>
                    {organizations[assessment.organization_id]}
                  </a>
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/assessments/${assessment.assessment_id}`)}
                      className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/assessments/${assessment.assessment_id}/edit`)}
                      className="bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.assessment_id)}
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

      {assessments.length !== 0 && (
        <>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AssessmentIndex;