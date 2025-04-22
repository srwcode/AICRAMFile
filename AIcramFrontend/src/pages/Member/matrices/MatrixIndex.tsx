import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Matrix {
  matrix_id: string;
  name: string;
  type: 1 | 2 | 3;
}

interface Assessment {
  assessment_id: string;
  matrix_id: string;
}

interface PaginatedResponse {
  total_count: number;
  matrix_items: Matrix[];
}

const MatrixIndex = () => {
  const [matrices, setMatrices] = React.useState<Matrix[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [assessmentsCountMap, setAssessmentsCountMap] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const recordsPerPage = 10;

  React.useEffect(() => {
    const fetchMatrices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/matrices?page=${currentPage}&recordPerPage=${recordsPerPage}&startIndex=${(currentPage - 1) * recordsPerPage}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setMatrices([]);
          setTotalCount(0);
          return;
        }
  
        const data: PaginatedResponse = await response.json();
        setMatrices(data.matrix_items || []);
        setTotalCount(data.total_count || 0);
      } catch (err) {
        setMatrices([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrices();
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
          if (assessment.assessment_id && assessment.matrix_id) {
            map[assessment.matrix_id] = (map[assessment.matrix_id] || 0) + 1;
          }
        });
  
        setAssessmentsCountMap(map);
      } catch (err) {
        console.error('Error fetching assessments:', err);
      }
    };
  
    if (matrices.length > 0) {
      fetchAssessments();
    }
  }, [matrices.length]);

  const handleDelete = async (matrixId: string) => {
    if (!window.confirm('Are you sure you want to delete this matrix?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/matrices/remove/${matrixId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete matrix');

      toast.success('Matrix deleted successfully');
      setMatrices(matrices.filter(matrix => matrix.matrix_id !== matrixId));
      
      if (matrices.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete matrix');
      toast.error('Failed to delete matrix');
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
          <h1 className="text-2xl font-bold text-white mb-2">Matrices</h1>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm">Total: </span>
            <span className="ml-1 bg-gray-900 text-white text-sm px-2 py-0.5 rounded-full">{totalCount}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/matrices/create')}
          className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Matrix</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Name</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Type</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300">Assessments</th>
              <th className="w-1/4 py-4 px-6 font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
          {matrices.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-16 text-gray-400">
                <p>No matrices found</p>
              </td>
            </tr>
          ) : (
            matrices.map(matrix => (
              <tr key={matrix.matrix_id} className="hover:bg-gray-900/50 transition-colors">
                <td className="py-4 px-6 text-white">{matrix.name}</td>
                <td className="py-4 px-6 text-gray-300">
                  {matrix.type === 1 ? (
                    <span>3x3</span>
                  ) : matrix.type === 2 ? (
                    <span>4x4</span>
                  ) : matrix.type === 3 ? (
                    <span>5x5</span>
                  ) : null}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-gray-900 text-gray-300 text-sm px-2 py-1 rounded">
                    {assessmentsCountMap[matrix.matrix_id] || 0}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/member/matrices/${matrix.matrix_id}`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="View Details"
                    >
                      View
                    </button>
                    {(assessmentsCountMap[matrix.matrix_id] || 0) === 0 && (
                    <>
                    <button
                      onClick={() => navigate(`/member/matrices/${matrix.matrix_id}/edit`)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                      title="Edit Matrix"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(matrix.matrix_id)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-red-900/70 transition-colors"
                      title="Delete Matrix"
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

      {matrices.length > 0 && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default MatrixIndex;