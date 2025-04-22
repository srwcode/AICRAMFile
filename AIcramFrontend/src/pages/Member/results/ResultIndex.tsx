import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface Vulnerability {
  name?: string;
  description?: string;
  cve?: string[];
  mitre?: string[];
}

interface Content {
  vulnerability?: Vulnerability[];
}

interface Result {
  result_id: string;
  assessment_id: string;
  user_id: string;
  content: Content;
  status: number;
  created_at: string;
}

interface PaginatedResponse {
  total_count: number;
  result_items: Result[];
}

const ResultIndex = () => {
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [assessments, setAssessments] = useState<{ [key: string]: string }>({});
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

            if(assessmentId) {
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

  const formatDateResult = (dateString: string) => {
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

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Results</h1>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm">Total: </span>
            <span className="ml-1 bg-gray-900 text-white text-sm px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="w-[24%] py-4 px-6 font-medium text-gray-300">Created</th>
              <th className="w-[20%] py-4 px-6 font-medium text-gray-300">Assessment</th>
              <th className="w-[20%] py-4 px-6 font-medium text-gray-300">Status</th>
              <th className="w-[20%] py-4 px-6 font-medium text-gray-300">Vulnerability</th>
              <th className="w-[16%] py-4 px-6 font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
          {results.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-16 text-gray-400">
                <p>No results found</p>
              </td>
            </tr>
          ) : (
            results.map(result => (
              <tr key={result.result_id} className="hover:bg-gray-900/50 transition-colors">
                <td className="py-4 px-6 text-white">{formatDateResult(result.created_at)}</td>
                <td className="py-4 px-6">
                  {result.assessment_id ? (
                    <a className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/member/assessments/${result.assessment_id}`)}>
                      {assessments[result.assessment_id]}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">No assessment</p>
                  )}
                </td>
                <td className="py-4 px-6">
                  {result.status === 1 ? (
                    <span className="bg-green-900/50 text-green-300 text-xs font-medium px-2.5 py-1.5 rounded">Completed</span>
                  ) : (
                    <span className="bg-red-900/50 text-red-300 text-xs font-medium px-2.5 py-1.5 rounded">Failed</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {result.status === 1 ? (
                    <span>
                    {result.content.vulnerability && (
                      <span className="bg-gray-900 text-gray-300 text-sm px-2 py-1 rounded">
                        {result.content.vulnerability.length || 0}
                      </span>
                    )}
                    </span>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/member/results/${result.result_id}`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {results.length > 0 && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ResultIndex;