import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Result {
  result_id: string;
  user_id: string;
  status: 1 | 2 | 3;
  assessment_id: string;
}

interface PaginatedResponse {
  total_count: number;
  result_items: Result[];
}

const ResultIndex = () => {
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [loadingUsernames, setLoadingUsernames] = useState<{ [key: string]: boolean }>({});
  const [assessments, setAssessments] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const recordsPerPage = 10;

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/results?page=${currentPage}&recordPerPage=${recordsPerPage}&startIndex=${(currentPage - 1) * recordsPerPage}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setResults([]);
          setTotalCount(0);
          return;
        }
  
        const data: PaginatedResponse = await response.json();
        setResults(data.result_items || []);
        setTotalCount(data.total_count || 0);
      } catch (err) {
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [currentPage]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const userIds = results.map(result => result.user_id);
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

    if (results.length > 0) {
      fetchUsernames();
    }
  }, [results]);

  const handleDelete = async (resultId: string) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/results/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete result');

      toast.success('Result deleted successfully');
      setResults(results.filter(result => result.result_id !== resultId));
      
      if (results.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete result');
    }
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      const assessmentIds = results.map(result => result.assessment_id);
      const uniqueAssessmentIds = [...new Set(assessmentIds)];
      
      const newLoadingStates: { [key: string]: boolean } = {};
      const newAssessments: { [key: string]: string } = { ...assessments };
      
      uniqueAssessmentIds.forEach(assessmentId => {
        newLoadingStates[assessmentId] = true;
      });

      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          uniqueAssessmentIds.map(async (assessmentId) => {
            try {
              const response = await fetch(`${config.API_URL}/assessments/${assessmentId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'token': token || ''
                }
              });

              if (!response.ok) {
                throw new Error('Failed to fetch assessment');
              }

              const data = await response.json();
              newAssessments[assessmentId] = data.name;
            } catch (error) {
              console.error(`Error fetching:`, error);
              newAssessments[assessmentId] = "";
            } finally {
              newLoadingStates[assessmentId] = false;
            }
          })
        );

        setAssessments(newAssessments);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    if (results.length > 0) {
      fetchAssessments();
    }
  }, [results]);

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
        <h1 className="text-2xl font-bold">Results ({totalCount})</h1>
        <button
          onClick={() => navigate('/admin/results/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left">
              <th className="min-w-[120px] py-4 px-4 font-medium text-black pl-6">User</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Status</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Assessment</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-20 text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            results.map(result => (
              <tr key={result.result_id} className="hover:bg-gray-50">
                <td className="border-b border-[#eee] py-5 px-4 pl-6">
                  {loadingUsernames[result.user_id] ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <a className="text-blue-500 hover:underline" href={`/admin/users/${result.user_id}`}>
                      {usernames[result.user_id] || "Unknown User"}
                    </a>
                  )}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  {result.status === 1 ? (
                    <span className="bg-green-500 text-white py-1.5 px-3 rounded-full text-sm">Completed</span>
                  ) : result.status === 2 ? (
                    <span className="bg-red-500 text-white py-1.5 px-3 rounded-full text-sm">Failed</span>
                  ) : result.status === 3 ? (
                    <span className="bg-gray-500 text-white py-1.5 px-3 rounded-full text-sm">Removed</span>
                  ) : null}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <a className="text-blue-500 hover:underline" href={`/admin/assessments/${result.assessment_id}`}>
                    {assessments[result.assessment_id]}
                  </a>
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/results/${result.result_id}`)}
                      className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/admin/results/${result.result_id}/edit`)}
                      className="bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(result.result_id)}
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

      {results.length !== 0 && (
        <>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ResultIndex;