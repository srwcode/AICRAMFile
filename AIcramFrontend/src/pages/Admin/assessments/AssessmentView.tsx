import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';

interface Assessment {
  assessment_id: string;
  user_id: string;
  name: string;
  status: 1 | 2;
  matrix_id: string;
  organization_id: string;
  situation: string;
  asset: string[];
  threat: string[];
  constraint: string;
  created_at: string;
  updated_at: string;
}

interface Matrix {
  user_id: string;
  name: string;
}

interface Organization {
  user_id: string;
  name: string;
}

const AssessmentView = () => {
  const { assessment_id } = useParams<{ assessment_id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [matrix, setMatrix] = React.useState<Matrix | null>(null);
  const [organization, setOrganization] = React.useState<Organization | null>(null);

  React.useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/assessments/${assessment_id}`, {
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

    fetchAssessment();
  }, [assessment_id]);

  useEffect(() => {
    const fetchUsername = async () => {
      const userId = assessment?.user_id;

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

    if (assessment && assessment.user_id) {
      fetchUsername();
    }
  }, [assessment]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  useEffect(() => {
    const fetchMatrix = async () => {

      const matrixId = assessment?.matrix_id;

      if (matrixId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/matrices/${matrixId}`, {
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
    }

    if (assessment && assessment.matrix_id) {
      fetchMatrix();
    }
  }, [assessment]);

  useEffect(() => {
    const fetchOrganization = async () => {

      const organizationId = assessment?.organization_id;

      if (organizationId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/organizations/${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });

          if (!response.ok) throw new Error('Failed to fetch organization');
          const data = await response.json();
          setOrganization(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load organization');
        } finally {
          setLoading(false);
        }
      };
    }

    if (assessment && assessment.organization_id) {
      fetchOrganization();
    }
  }, [assessment]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!assessment) return <div>Assessment not found</div>;

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Assessment Details</h1>

        <div className="space-y-5">
          <div>
            <p className="font-medium text-gray-600 mb-1">ID</p>
            <p>{assessment.assessment_id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Name</p>
            <p>{assessment.name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">User</p>
            <p>
              {loadingUsername ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <a className="text-blue-500 hover:underline" href={`/admin/users/${assessment.user_id}`}>
                  {username || "Unknown User"}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Status</p>
            <p>
              {assessment.status === 1 ? (
                <span className="text-green-500">Active</span>
              ) : assessment.status === 2 ? (
                <span className="text-red-500">Inactive</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Matrix</p>
            <p>
              {matrix && (
                <a className="text-blue-500 hover:underline" href={`/admin/matrices/${assessment.matrix_id}`}>
                  {matrix.name}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Organization</p>
            <p>
              {organization && (
                <a className="text-blue-500 hover:underline" href={`/admin/organizations/${assessment.organization_id}`}>
                  {organization.name}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Situation</p>
            <p className="whitespace-pre-wrap">{assessment.situation}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Assets</p>
            <p>
              {assessment.asset.length > 0 && (
              <>
                {assessment.asset.map((as) => (
                  <p>• {as}</p>
                ))}
              </>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Threats</p>
            <p>
              {assessment.threat.length > 0 && (
              <>
                {assessment.threat.map((th) => (
                  <p>• {th}</p>
                ))}
              </>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Constraint</p>
            <p className="whitespace-pre-wrap">{assessment.constraint}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Created</p>
            <p>{formatDate(assessment.created_at)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Updated</p>
            <p>{formatDate(assessment.updated_at)}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/admin/assessments/${assessment_id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/admin/assessments')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

      </div>
    </>
  );
};

export default AssessmentView;