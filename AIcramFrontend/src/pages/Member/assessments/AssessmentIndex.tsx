import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from 'react-toastify';
import config from '../../../config';

interface Assessment {
  assessment_id: string;
  name: string;
  matrix_id: string;
  organization_id: string;
  created_at: string;
}

interface PaginatedResponse {
  total_count: number;
  assessment_items: Assessment[];
}

interface Result {
  result_id: string;
  assessment_id: string;
}

const AssessmentIndex = () => {
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [matrices, setMatrices] = useState<{ [key: string]: string }>({});
  const [matricesType, setMatricesType] = useState<{ [key: string]: number }>({});
  const [organizations, setOrganizations] = useState<{ [key: string]: string }>({});
  const [organizationsIndustry, setOrganizationsIndustry] = useState<{ [key: string]: string }>({});
  const [resultsCountMap, setResultsCountMap] = useState<Record<string, number>>({});
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

  const handleDelete = async (assessmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/assessments/remove/${assessmentId}`, {
        method: 'POST',
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

  useEffect(() => {
    const fetchMatrices = async () => {
      const matrixIds = assessments.map(assessment => assessment.matrix_id);
      const uniqueMatrixIds = [...new Set(matrixIds)];
      
      const newLoadingStates: { [key: string]: boolean } = {};
      const newMatrices: { [key: string]: string } = { ...matrices };
      const newMatricesType: { [key: string]: number } = { ...matricesType };
      
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
                newMatricesType[matrixId] = data.type;
              } catch (error) {
                console.error(`Error fetching:`, error);
                newMatrices[matrixId] = "";
                newMatricesType[matrixId] = 0;
              } finally {
                newLoadingStates[matrixId] = false;
              }
            }
          })
        );

        setMatrices(newMatrices);
        setMatricesType(newMatricesType);
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
      const newOrganizationsIndustry: { [key: string]: string } = { ...organizationsIndustry };
      
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
                newOrganizationsIndustry[organizationId] = data.industry;
              } catch (error) {
                console.error(`Error fetching:`, error);
                newOrganizations[organizationId] = "";
                newOrganizationsIndustry[organizationId] = "";
              } finally {
                newLoadingStates[organizationId] = false;
              }
            }
          })
        );

        setOrganizations(newOrganizations);
        setOrganizationsIndustry(newOrganizationsIndustry);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    if (assessments.length > 0) {
      fetchOrganizations();
    }
  }, [assessments]);

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/results?recordPerPage=9999`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
  
        if (!response.ok) return;
  
        const data = await response.json();
  
        const map: Record<string, number> = {};
  
        data.result_items.forEach((result: Result) => {
          if (result.result_id && result.assessment_id) {
            map[result.assessment_id] = (map[result.assessment_id] || 0) + 1;
          }
        });
  
        setResultsCountMap(map);
      } catch (err) {
        console.error('Error fetching results:', err);
      }
    };
  
    if (assessments.length > 0) {
      fetchResults();
    }
  }, [assessments.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDistanceToNow(date, { addSuffix: true, locale: enUS })}`;
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
          <h1 className="text-2xl font-bold text-white mb-2">Assessments</h1>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm">Total: </span>
            <span className="ml-1 bg-gray-900 text-white text-sm px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/assessments/create')}
          className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Assessment</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="w-[30%] py-4 px-6 font-medium text-gray-300">Name</th>
              <th className="w-[20%] py-4 px-6 font-medium text-gray-300">Organization</th>
              <th className="w-[20%] py-4 px-6 font-medium text-gray-300">Matrix</th>
              <th className="w-[15%] py-4 px-6 font-medium text-gray-300">Results</th>
              <th className="w-[15%] py-4 px-6 font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
          {assessments.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-16 text-gray-400">
                <p>No assessments found</p>
              </td>
            </tr>
          ) : (
            assessments.map(assessment => (
              <tr key={assessment.assessment_id} className="hover:bg-gray-900/50 transition-colors">
                <td className="py-4 px-6 text-white">
                  {assessment.name}
                  <p className="text-sm text-gray-400 mt-2">{formatDate(assessment.created_at)}</p>
                </td>
                <td className="py-4 px-6 text-white">
                  {assessment.organization_id ? (
                    <>
                    <a className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/member/organizations/${assessment.organization_id}`)}>
                      {organizations[assessment.organization_id]}
                    </a>
                    <p className="text-sm text-gray-400 mt-2">{organizationsIndustry[assessment.organization_id]}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No organization</p>
                  )}
                </td>
                <td className="py-4 px-6 text-white">
                  {assessment.matrix_id ? (
                    <>
                    <a className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/member/matrices/${assessment.matrix_id}`)}>
                      {matrices[assessment.matrix_id]}
                    </a>
                    <p className="text-sm text-gray-400 mt-2">
                      {matricesType[assessment.matrix_id] === 1 ? (
                        <span>3x3</span>
                      ) : matricesType[assessment.matrix_id] === 2 ? (
                        <span>4x4</span>
                      ) : matricesType[assessment.matrix_id] === 3 ? (
                        <span>5x5</span>
                      ) : null}
                    </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Default</p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-gray-900 text-gray-300 text-sm px-2 py-1 rounded">
                    {resultsCountMap[assessment.assessment_id] || 0}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/member/assessments/${assessment.assessment_id}`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      View
                    </button>
                    <div className="hidden">
                    <button
                      onClick={() => navigate(`/member/assessments/${assessment.assessment_id}/edit`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="Edit Assessment"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.assessment_id)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-red-900/70 transition-colors"
                      title="Delete Assessment"
                    >
                      Delete
                    </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {assessments.length > 0 && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default AssessmentIndex;