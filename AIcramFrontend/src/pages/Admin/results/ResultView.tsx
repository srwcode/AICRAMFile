import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';

interface Result {
  result_id: string;
  user_id: string;
  status: 1 | 2 | 3;
  assessment_id: string;
  content: JSON;
  created_at: string;
  updated_at: string;
}

interface Assessment {
  user_id: string;
  name: string;
}

const ResultView = () => {
  const { result_id } = useParams<{ result_id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = React.useState<Result | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [assessment, setAssessment] = React.useState<Assessment | null>(null);

  React.useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/results/${result_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });

        if (!response.ok) throw new Error('Failed to fetch result');
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [result_id]);

  useEffect(() => {
    const fetchUsername = async () => {
      const userId = result?.user_id;

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

    if (result && result.user_id) {
      fetchUsername();
    }
  }, [result]);

  useEffect(() => {
    const fetchAssessment = async () => {

      const assessmentId = result?.assessment_id;

      if (assessmentId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/assessments/${assessmentId}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });

          if (!response.ok) throw new Error('Failed to fetch assessment');
          const data = await response.json();
          setAssessment(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load assessment');
        } finally {
          setLoading(false);
        }
      };
    }

    if (result && result.assessment_id) {
      fetchAssessment();
    }
  }, [result]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!result) return <div>Result not found</div>;

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Result Details</h1>

        <div className="space-y-5">
          <div>
            <p className="font-medium text-gray-600 mb-1">ID</p>
            <p>{result.result_id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">User</p>
            <p>
              {loadingUsername ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <a className="text-blue-500 hover:underline" href={`/admin/users/${result.user_id}`}>
                  {username || "Unknown User"}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Status</p>
            <p>
              {result.status === 1 ? (
                <span className="text-green-500">Completed</span>
              ) : result.status === 2 ? (
                <span className="text-red-500">Failed</span>
              ) : result.status === 3 ? (
                <span className="text-gray-500">Removed</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Assessment</p>
            <p>
              {assessment && (
                <a className="text-blue-500 hover:underline" href={`/admin/assessments/${result.assessment_id}`}>
                  {assessment.name}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Content</p>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
              {(() => {
                try {
                  const parsedContent = result.content;
                  return JSON.stringify(parsedContent, null, 2);
                } catch (error) {
                  return `Invalid JSON: ${result.content}`;
                }
              })()}
            </pre>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Created</p>
            <p>{formatDate(result.created_at)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Updated</p>
            <p>{formatDate(result.updated_at)}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/admin/results/${result_id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/admin/results')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

      </div>
    </>
  );
};

export default ResultView;