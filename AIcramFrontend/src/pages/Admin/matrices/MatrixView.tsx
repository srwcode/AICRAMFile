import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';

interface Matrix {
  matrix_id: string;
  user_id: string;
  name: string;
  status: 1 | 2;
  type: 1 | 2 | 3;
  description: string;
  impact_1: string;
  impact_2: string;
  impact_3: string;
  impact_4: string;
  impact_5: string;
  likelihood_1: string;
  likelihood_2: string;
  likelihood_3: string;
  likelihood_4: string;
  likelihood_5: string;
  created_at: string;
  updated_at: string;
}

const MatrixView = () => {
  const { matrix_id } = useParams<{ matrix_id: string }>();
  const navigate = useNavigate();
  const [matrix, setMatrix] = React.useState<Matrix | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/matrices/${matrix_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });

        if (!response.ok) throw new Error('Failed to fetch matrix');
        const data = await response.json();
        setMatrix(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matrix');
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, [matrix_id]);

  useEffect(() => {
    const fetchUsername = async () => {
      const userId = matrix?.user_id;

      if (userId) {
        setLoadingUsername(true);

        try {
          const token = localStorage.getItem('token');
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
          setUsername(data.username);
        } catch (error) {
          console.error('Error fetching username:', error);
          setUsername('Unknown User');
        } finally {
          setLoadingUsername(false);
        }
      }
    };

    if (matrix && matrix.user_id) {
      fetchUsername();
    }
  }, [matrix]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!matrix) return <div>Matrix not found</div>;

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Matrix Details</h1>

        <div className="space-y-5">
          <div>
            <p className="font-medium text-gray-600 mb-1">ID</p>
            <p>{matrix.matrix_id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Name</p>
            <p>{matrix.name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">User</p>
            <p>
              {loadingUsername ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <a className="text-blue-500 hover:underline" href={`/admin/users/${matrix.user_id}`}>
                  {username || "Unknown User"}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Status</p>
            <p>
              {matrix.status === 1 ? (
                <span className="text-green-500">Active</span>
              ) : matrix.status === 2 ? (
                <span className="text-red-500">Inactive</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Type</p>
            <p>
              {matrix.type === 1 ? (
                <span>3x3</span>
              ) : matrix.type === 2 ? (
                <span>4x4</span>
              ) : matrix.type === 3 ? (
                <span>5x5</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Description</p>
            <p className="whitespace-pre-wrap">{matrix.description}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Impact - Very Low</p>
            <p className="whitespace-pre-wrap">{matrix.impact_1}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Impact - Low</p>
            <p className="whitespace-pre-wrap">{matrix.impact_2}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Impact - Medium</p>
            <p className="whitespace-pre-wrap">{matrix.impact_3}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Impact - High</p>
            <p className="whitespace-pre-wrap">{matrix.impact_4}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Impact - Extreme</p>
            <p className="whitespace-pre-wrap">{matrix.impact_5}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Likelihood - Very Low</p>
            <p className="whitespace-pre-wrap">{matrix.likelihood_1}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Likelihood - Low</p>
            <p className="whitespace-pre-wrap">{matrix.likelihood_2}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Likelihood - Medium</p>
            <p className="whitespace-pre-wrap">{matrix.likelihood_3}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Likelihood - High</p>
            <p className="whitespace-pre-wrap">{matrix.likelihood_4}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Likelihood - Extreme</p>
            <p className="whitespace-pre-wrap">{matrix.likelihood_5}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Created</p>
            <p>{formatDate(matrix.created_at)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Updated</p>
            <p>{formatDate(matrix.updated_at)}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/admin/matrices/${matrix_id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/admin/matrices')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

      </div>
    </>
  );
};

export default MatrixView;