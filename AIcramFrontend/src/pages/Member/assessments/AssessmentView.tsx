import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from 'react-toastify';
import config from '../../../config';
import { ChevronRight, Pen, Copy, RotateCcw, Sparkle, Trash } from 'lucide-react';

interface Assessment {
  assessment_id: string;
  name: string;
  matrix_id: string;
  organization_id: string;
  situation: string;
  asset: string[];
  threat: string[];
  constraint: string;
  created_at: string;
  updated_at: string;
}

interface Vulnerability {
  name?: string;
  description?: string;
  cve?: string[];
  mitre?: string[];
}

interface Control {
  name?: string;
  description?: string;
  nist?: string;
  iso?: string;
}

interface Content {
  success?: number;
  impact?: number;
  likelihood?: number;
  new_impact?: number;
  new_likelihood?: number;
  vulnerability?: Vulnerability[];
  control?: Control[];
  summary?: string;
  message?: string;
}

interface Result {
  result_id: string;
  assessment_id: string;
  user_id: string;
  content: Content;
  status: number;
  created_at: string;
  updated_at: string;
}

interface Matrix {
  name: string;
  type: 1 | 2 | 3;
}

interface Organization {
  name: string;
}

const AssessmentView = () => {
  const { assessment_id } = useParams<{ assessment_id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [results, setResults] = React.useState<Result[]>([]);
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

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/results?assessment_id=${assessment_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });

        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        
        const resultItems = data.result_items || [];
        setResults(resultItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    if (assessment_id) {
      fetchResults();
    }
  }, [assessment_id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  const formatDateResult = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDistanceToNow(date, { addSuffix: true, locale: enUS })}`;
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
        }
      };
    }

    if (assessment && assessment.organization_id) {
      fetchOrganization();
    }
  }, [assessment]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/assessments/remove/${assessment_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete assessment');

      toast.success('Assessment deleted successfully');
      navigate('/member/assessments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
      toast.error('Failed to delete assessment');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!assessment) return <div>Assessment not found</div>;

  return (
    <>
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-8">Assessment: {assessment.name}</h1>

      <div className="flex flex-wrap gap-4 mb-8 w-fit">
        {results.length > 0 ? (
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw size={18} />
            <span>Reanalyze</span>
          </button>
        ) : (
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Sparkle size={18} />
            <span>Analyze</span>
          </button>
        )}

        <button
          onClick={() => navigate(`/member/assessments/${assessment.assessment_id}/edit`)}
          className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <Pen size={18} />
          <span>Edit</span>
        </button>

        <button
          onClick={() => navigate(`/member/assessments/${assessment.assessment_id}/clone`)}
          className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <Copy size={18} />
          <span>Clone</span>
        </button>

        <button
          onClick={() => handleDelete()}
          className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <Trash size={18} />
          <span>Delete</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Basic Information</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Organization</p>
                {assessment.organization_id && organization ? (
                  <a className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/member/organizations/${assessment.organization_id}`)}>
                    {organization.name}
                  </a>
                ) : (
                  <p className="text-gray-500">No organization</p>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Matrix</p>
                {assessment.matrix_id && matrix ? (
                  <a className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/member/matrices/${assessment.matrix_id}`)}>
                    {matrix.name}
                  </a>
                ) : (
                  <p className="text-gray-500">Default</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Created</p>
                <p className="text-gray-300">{formatDate(assessment.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Updated</p>
                <p className="text-gray-300">{formatDate(assessment.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Situation</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {assessment.situation ? (
              <p className="text-gray-300 whitespace-pre-wrap">{assessment.situation}</p>
            ) : (
              <p className="text-gray-500">No situation</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Constraint</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {assessment.constraint ? (
              <p className="text-gray-300 whitespace-pre-wrap">{assessment.constraint}</p>
            ) : (
              <p className="text-gray-500">No constraint</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Assets</h2>
          {assessment.asset.length > 0 ? (
            <div className="p-5 bg-gray-900 rounded-b-lg space-y-2 min-h-30">
              {assessment.asset.map((as, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  <p className="text-gray-300">{as}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 bg-gray-900 rounded-b-lg min-h-30">
              <p>No assets found</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Threats</h2>
          {assessment.threat.length > 0 ? (
            <div className="p-5 bg-gray-900 rounded-b-lg space-y-2 min-h-30">
              {assessment.threat.map((th, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  <p className="text-gray-300">{th}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 bg-gray-900 rounded-b-lg min-h-30">
              <p>No threats found</p>
            </div>
          )}
        </div>

      </div>
    </div>

    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-white mb-2">Results</h1>
      <div className="flex items-center mb-6">
        <span className="text-gray-400 text-sm">Total: </span>
        <span className="ml-1 bg-gray-900 text-white text-sm px-2 py-0.5 rounded-full">{results.length}</span>
      </div>

      {results.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-gray-700">
              <tr className="bg-gray-900 text-left">
                <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Created</th>
                <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Status</th>
                <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Vulnerability</th>
                <th className="px-6 py-5 text-left font-medium text-gray-300"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {results.map((result, index) => (
                <tr 
                  key={index}
                  className="bg-gray-900 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    window.scrollTo(0, 0); 
                    navigate(`/member/results/${result.result_id}`);
                  }}
                >
                  <td className="px-6 py-5 text-white">{formatDateResult(result.created_at)}</td>
                  <td className="px-6 py-5">
                    {result.status === 1 ? (
                      <span className="bg-green-900/50 text-green-300 text-xs font-medium px-2.5 py-1.5 rounded">Completed</span>
                    ) : (
                      <span className="bg-red-900/50 text-red-300 text-xs font-medium px-2.5 py-1.5 rounded">Failed</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-white">
                    {result.status === 1 ? (
                      <span>
                      {result.content.vulnerability && (
                        <span>{result.content.vulnerability.length}</span>
                      )}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-white"><ChevronRight /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-15 text-gray-400 ">
          <p>No results found</p>
        </div>
      )}
    </div>

    </>
  );
};

export default AssessmentView;