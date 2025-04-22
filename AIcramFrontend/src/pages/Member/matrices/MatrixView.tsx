import React from 'react';
import { useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';

interface Matrix {
  matrix_id: string;
  name: string;
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
  const [matrix, setMatrix] = React.useState<Matrix | null>(null);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!matrix) return <div>Matrix not found</div>;

  const getRiskLevelAndColor = (impact: number, likelihood: number) => {
    type RiskLevel = 'veryLow' | 'low' | 'medium' | 'high' | 'critical';
    type RiskDefinition = { level: string; class: string };
    
    const riskDefinitions: Record<RiskLevel, RiskDefinition> = {
      veryLow: { level: "Very Low", class: "bg-blue-900/50 text-blue-300" },
      low: { level: "Low", class: "bg-green-900/50 text-green-300" },
      medium: { level: "Medium", class: "bg-yellow-900/50 text-yellow-300" },
      high: { level: "High", class: "bg-orange-900/50 text-orange-300" },
      critical: { level: "Critical", class: "bg-red-900/50 text-red-300" }
    };
  
    const key = `${impact},${likelihood}`;
    
    if (matrix.type === 1) {
      const matrix3x3: Record<string, RiskLevel> = {
        "1,1": "low", "1,2": "low", "2,1": "low",
        "1,3": "medium", "2,2": "medium", "3,1": "medium",
        "2,3": "high", "3,2": "high", "3,3": "high"
      };
      return riskDefinitions[matrix3x3[key] || "medium"];
    }
    
    else if (matrix.type === 2) {
      const matrix4x4: Record<string, RiskLevel> = {
        "1,1": "low", "1,2": "low", "2,1": "low",
        "1,3": "medium", "1,4": "medium", "2,2": "medium", "3,1": "medium", "4,1": "medium",
        "2,3": "high", "2,4": "high", "3,2": "high", "3,3": "high", "4,2": "high",
        "3,4": "critical", "4,3": "critical", "4,4": "critical"
      };
      return riskDefinitions[matrix4x4[key] || "medium"];
    }
    
    else {
      const matrix5x5: Record<string, RiskLevel> = {
        "1,1": "veryLow", "1,2": "veryLow", "2,1": "veryLow",
        "1,3": "low", "2,2": "low", "3,1": "low",
        "1,4": "medium", "1,5": "medium", "2,3": "medium", "2,4": "medium",
        "3,2": "medium", "3,3": "medium", "4,1": "medium", "4,2": "medium", "5,1": "medium",
        "2,5": "high", "3,4": "high", "3,5": "high", "4,3": "high",
        "4,4": "high", "5,2": "high", "5,3": "high",
        "4,5": "critical", "5,4": "critical", "5,5": "critical"
      };
      return riskDefinitions[matrix5x5[key] || "medium"];
    }
  };

  const getMatrixLabels = () => {
    if (matrix.type === 1) {
      return {
        impact: ['Low', 'Medium', 'High'],
        likelihood: ['High', 'Medium', 'Low']
      };
    } else if (matrix.type === 2) {
      return {
        impact: ['Low', 'Medium', 'High', 'Extreme'],
        likelihood: ['Extreme', 'High', 'Medium', 'Low']
      };
    } else {
      return {
        impact: ['Very Low', 'Low', 'Medium', 'High', 'Extreme'],
        likelihood: ['Extreme', 'High', 'Medium', 'Low', 'Very Low']
      };
    }
  };

  const renderRiskMatrix = () => {
    const { impact, likelihood } = getMatrixLabels();
    const size = matrix.type === 1 ? 3 : matrix.type === 2 ? 4 : 5;

    return (
      <div>
        <div className="flex justify-center mb-6">
          <div className="text-gray-300 font-medium ml-13">Impact</div>
        </div>
        <div className="flex">
          <div className="flex items-center mr-2">
            <div className="transform -rotate-90 text-gray-300 font-medium whitespace-nowrap -ml-5">
              Likelihood
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="min-w-30 w-[10%] px-4 py-6 text-sm font-medium text-gray-300 border border-gray-700"></th>
                  {impact.map((label, i) => (
                    <th 
                      key={i} 
                      className="min-w-35 w-[18%] px-4 py-6 text-sm font-medium text-gray-300 border border-gray-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {likelihood.map((likelihoodLabel, row) => (
                  <tr key={row} className="bg-gray-900">
                    <th className="px-4 py-6 text-sm font-medium text-gray-300 border border-gray-700">
                      {likelihoodLabel}
                    </th>
                    {impact.map((_, col) => {
                      const impactValue = col + 1;
                      const likelihoodValue = size - row;
                      const { level, class: colorClass } = getRiskLevelAndColor(impactValue, likelihoodValue);
                      return (
                        <td 
                          key={col} 
                          className={`px-4 py-6 text-center border border-gray-700 ${colorClass}`}
                        >
                          {level}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8 text-gray-400 text-sm">
          <p className="mb-1">X-axis: Impact increases from left to right</p>
          <p>Y-axis: Likelihood increases from bottom to top</p>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-8">Matrix: {matrix.name}</h1>

      <div className="space-y-8">

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Basic Information</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Type</p>
              <p className="text-white">
                {matrix.type === 1 ? (
                  <span>3x3</span>
                ) : matrix.type === 2 ? (
                  <span>4x4</span>
                ) : matrix.type === 3 ? (
                  <span>5x5</span>
                ) : null}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Description</p>
              {matrix.description ? (
                <p className="text-gray-300 whitespace-pre-wrap">{matrix.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Created</p>
                <p className="text-gray-300">{formatDate(matrix.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Updated</p>
                <p className="text-gray-300">{formatDate(matrix.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Matrix Visualization</h2>
          <div className="pl-6 pr-8 py-6 bg-gray-900 rounded-b-lg">
            {renderRiskMatrix()}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Impact Definitions</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg space-y-5">
            {matrix.type === 3 && (
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Impact - Very Low</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.impact_1}</p>
            </div>
            )}
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Impact - Low</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.impact_2}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Impact - Medium</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.impact_3}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Impact - High</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.impact_4}</p>
            </div>
            {(matrix.type === 2 || matrix.type === 3) && (
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Impact - Extreme</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.impact_5}</p>
            </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Likelihood Definitions</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg space-y-5">
            {matrix.type === 3 && (
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Likelihood - Very Low</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.likelihood_1}</p>
            </div>
            )}
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Likelihood - Low</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.likelihood_2}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Likelihood - Medium</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.likelihood_3}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Likelihood - High</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.likelihood_4}</p>
            </div>
            {(matrix.type === 2 || matrix.type === 3) && (
            <div>
              <p className="text-gray-400 text-sm mb-1.5">Likelihood - Extreme</p>
              <p className="text-gray-300 whitespace-pre-wrap">{matrix.likelihood_5}</p>
            </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MatrixView;