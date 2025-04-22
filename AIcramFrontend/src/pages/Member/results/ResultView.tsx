import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { ArrowLeft, AlertTriangle, Pen, CircleCheck, Dot, XCircle, Clock, Calendar, ChevronDown, ChevronUp, MoveRight, CircleCheckBig } from 'lucide-react';
import config from '../../../config';

interface Control {
  name?: string;
  description?: string;
  nist?: string;
  iso?: string;
}

interface Vulnerability {
  name?: string;
  description?: string;
  cve?: string[];
  mitre?: string[];
  impact?: number;
  likelihood?: number;
  new_impact?: number;
  new_likelihood?: number;
  control?: Control[];
}

interface Content {
  success?: number;
  vulnerability?: Vulnerability[];
  summary?: string;
  message?: string;
}

interface Result {
  result_id: string;
  user_id?: string;
  status?: 1 | 2 | 3;
  assessment_id?: string;
  content?: Content;
  created_at: string;
  updated_at: string;
}

interface Assessment {
  user_id: string;
  name: string;
  matrix_id: string;
}

interface Matrix {
  matrix_id: string;
  name: string;
  type: 1 | 2 | 3;
}

const ResultView = () => {
  const { result_id } = useParams<{ result_id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [expandedVulnerability, setExpandedVulnerability] = useState<number | null>(null);
  const [showAllVulnerabilities, setShowAllVulnerabilities] = useState(false);
  const [hasCompletedResults, setHasCompletedResults] = useState(false);

  useEffect(() => {
    const mainScrollArea = document.querySelector('.main-scroll-area');
    if (mainScrollArea) {
      mainScrollArea.scrollTop = 0;
    }
  }, [result_id]);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
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

        if (data.assessment_id) {
          setLoadingAssessment(true);
          setLoadingResults(true);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [result_id]);

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
          setLoadingAssessment(false);

          if (data.matrix_id) {
            setLoadingMatrix(true);
          } else {
            setLoadingMatrix(false);
          }

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load assessment');
          setLoadingAssessment(false);
        }
      }
    };

    if (result && result.assessment_id) {
      fetchAssessment();
    }
  }, [result]);

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
          setLoadingMatrix(false);
        }
      }
    };

    if (assessment && assessment.matrix_id) {
      fetchMatrix();
    }
  }, [assessment]);

  useEffect(() => {
    const fetchAllResults = async () => {
      if (result?.assessment_id) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/results?assessment_id=${result.assessment_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });
  
          if (!response.ok) throw new Error('Failed to fetch results');
          const data = await response.json();
          
          const resultItems = data.result_items || [];
          const completedResults = resultItems.filter((res: Result) => res.status === 1);
          setHasCompletedResults(completedResults.length > 0);
        } catch (err) {
          console.error('Error fetching results:', err);
        } finally {
          setLoadingResults(false);
        }
      }
    };
  
    fetchAllResults();
  }, [result]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
  };

  const getRiskRating = (impact: number = 0, likelihood: number = 0) => {
    if (impact === 0 || likelihood === 0) return 0;

    if (matrix?.type === 1) {
      if(impact === 2) {
        if(likelihood === 2) return 2;
        else if(likelihood === 3) return 2;
        else if(likelihood === 4) return 3;
      }
      else if(impact === 3) {
        if(likelihood === 2) return 2;
        else if(likelihood === 3) return 3;
        else if(likelihood === 4) return 4;
      }
      else if(impact === 4) {
        if(likelihood === 2) return 3;
        else if(likelihood === 3) return 4;
        else if(likelihood === 4) return 4;
      }
    } else if (matrix?.type === 2) {
      if(impact === 2) {
        if(likelihood === 2) return 2;
        else if(likelihood === 3) return 2;
        else if(likelihood === 4) return 3;
        else if(likelihood === 5) return 3;
      }
      else if(impact === 3) {
        if(likelihood === 2) return 2;
        else if(likelihood === 3) return 3;
        else if(likelihood === 4) return 4;
        else if(likelihood === 5) return 4;
      }
      else if(impact === 4) {
        if(likelihood === 2) return 3;
        else if(likelihood === 3) return 4;
        else if(likelihood === 4) return 4;
        else if(likelihood === 5) return 5;
      }
      else if(impact === 5) {
        if(likelihood === 2) return 3;
        else if(likelihood === 3) return 4;
        else if(likelihood === 4) return 5;
        else if(likelihood === 5) return 5;
      }
    } else {
      if(impact === 1) {
        if(likelihood === 1) return 1;
        else if(likelihood === 2) return 1;
        else if(likelihood === 3) return 2;
        else if(likelihood === 4) return 3;
        else if(likelihood === 5) return 3;
      }
      if(impact === 2) {
        if(likelihood === 1) return 1;
        else if(likelihood === 2) return 2;
        else if(likelihood === 3) return 3;
        else if(likelihood === 4) return 3;
        else if(likelihood === 5) return 4;
      }
      else if(impact === 3) {
        if(likelihood === 1) return 2;
        else if(likelihood === 2) return 3;
        else if(likelihood === 3) return 3;
        else if(likelihood === 4) return 4;
        else if(likelihood === 5) return 4;
      }
      else if(impact === 4) {
        if(likelihood === 1) return 3;
        else if(likelihood === 2) return 3;
        else if(likelihood === 3) return 4;
        else if(likelihood === 4) return 4;
        else if(likelihood === 5) return 5;
      }
      else if(impact === 5) {
        if(likelihood === 1) return 3;
        else if(likelihood === 2) return 4;
        else if(likelihood === 3) return 4;
        else if(likelihood === 4) return 5;
        else if(likelihood === 5) return 5;
      }
    }
    return 0;
  };

  const getRiskColor = (level: number) => {
    switch(level) {
      case 1: return "bg-blue-900/50 text-blue-300";
      case 2: return "bg-green-900/50 text-green-300";
      case 3: return "bg-yellow-900/50 text-yellow-300";
      case 4: return "bg-orange-900/50 text-orange-300";
      case 5: return "bg-red-900/50 text-red-300";
      default: return "bg-gray-900 text-white";
    }
  };

  const getRiskLabel = (level: number) => {
    switch(level) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Critical';
      default: return 'Unknown';
    }
  };

  const getStatusInfo = (status?: number) => {
    switch(status) {
      case 1:
        return {
          label: 'Completed',
          icon: <CircleCheck className="inline-block mr-2 text-gray-400" size={18} />,
          color: 'text-gray-400'
        };
      case 2:
        return {
          label: 'Failed',
          icon: <XCircle className="inline-block mr-2 text-gray-400" size={18} />,
          color: 'text-gray-400'
        };
      default:
        return {
          label: 'Unknown',
          icon: <AlertTriangle className="inline-block mr-2 text-gray-400" size={18} />,
          color: 'text-gray-400'
        };
    }
  };

  const toggleVulnerability = (index: number) => {
    if (expandedVulnerability === index) {
      setExpandedVulnerability(null);
    } else {
      setExpandedVulnerability(index);
    }
  };

  const toggleAllVulnerabilities = () => {
    setShowAllVulnerabilities(!showAllVulnerabilities);
    if (!showAllVulnerabilities) {
      if (result?.content?.vulnerability && result.content.vulnerability.length > 0) {
        setExpandedVulnerability(0);
      }
    } else {
      setExpandedVulnerability(null);
    }
  };

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
    
    if (matrix?.type === 1) {
      const matrix3x3: Record<string, RiskLevel> = {
        "1,1": "low", "1,2": "low", "2,1": "low",
        "1,3": "medium", "2,2": "medium", "3,1": "medium",
        "2,3": "high", "3,2": "high", "3,3": "high"
      };
      return riskDefinitions[matrix3x3[key] || "medium"];
    }
    
    else if (matrix?.type === 2) {
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
    if (matrix?.type === 1) {
      return {
        impact: ['Low', 'Medium', 'High'],
        likelihood: ['High', 'Medium', 'Low']
      };
    } else if (matrix?.type === 2) {
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
    const size = matrix?.type === 1 ? 3 : matrix?.type === 2 ? 4 : 5;
    
    const currentRiskPositions: Record<string, number[]> = {};
    const residualRiskPositions: Record<string, number[]> = {};
    
    if (result?.content?.vulnerability) {
      result.content.vulnerability.forEach((vuln, index) => {
        const currentImpact = vuln.impact || 0;
        const currentLikelihood = vuln.likelihood || 0;
        const residualImpact = vuln.new_impact || 0;
        const residualLikelihood = vuln.new_likelihood || 0;
        
        if (currentImpact > 0 && currentLikelihood > 0) {
          const currentKey = `${size - currentLikelihood},${currentImpact - 1}`;
          if (!currentRiskPositions[currentKey]) {
            currentRiskPositions[currentKey] = [];
          }
          currentRiskPositions[currentKey].push(index + 1);
        }
        
        if (residualImpact > 0 && residualLikelihood > 0) {
          const residualKey = `${size - residualLikelihood},${residualImpact - 1}`;
          if (!residualRiskPositions[residualKey]) {
            residualRiskPositions[residualKey] = [];
          }
          residualRiskPositions[residualKey].push(index + 1);
        }
      });
    }

    const getVulnName = (index: number): string => {
      if (result?.content?.vulnerability && result.content.vulnerability[index - 1]) {
        return result.content.vulnerability[index - 1].name || `Vulnerability ${index}`;
      }
      return `Vulnerability ${index}`;
    };
  
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
                      const { class: colorClass } = getRiskLevelAndColor(impactValue, likelihoodValue);
                      const posKey = `${row},${col}`;
                      const currentVulns = currentRiskPositions[posKey] || [];
                      const residualVulns = residualRiskPositions[posKey] || [];
                      
                      return (
                        <td key={col} className={`px-4 py-6 text-center border border-gray-700 ${colorClass} relative`}>
                          <div className="flex flex-wrap justify-center gap-4">
                            {currentVulns.map(num => (
                              <div key={`current-${num}`} className="relative group">
                                <span className="w-8 h-8 flex items-center justify-center bg-black border border-white text-white text-sm rounded-full font-medium cursor-pointer">
                                  {num}
                                </span>
                                <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white p-2 rounded shadow-lg text-xs whitespace-nowrap bottom-full mb-1 left-1/2 transform -translate-x-1/2">
                                  {getVulnName(num)}
                                </div>
                              </div>
                            ))}
                            {residualVulns.map(num => (
                              <div key={`residual-${num}`} className="relative group">
                                <span className="w-8 h-8 flex items-center justify-center bg-white text-gray-900 text-sm rounded-full font-medium cursor-pointer">
                                  {num}
                                </span>
                                <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white p-2 rounded shadow-lg text-xs whitespace-nowrap bottom-full mb-1 left-1/2 transform -translate-x-1/2">
                                  {getVulnName(num)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-start justify-between mt-8 text-gray-400 text-sm">
          <div>
            <p className="mb-1">X-axis: Impact increases from left to right</p>
            <p>Y-axis: Likelihood increases from bottom to top</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-black border border-white text-white text-xs rounded-full font-medium mr-2">0</span>
              <span className="text-sm">Current Risk</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-white text-gray-900 text-xs rounded-full font-medium mr-2">0</span>
              <span className="text-sm">Residual Risk</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getRiskDistribution = () => {
    if (!result?.content?.vulnerability) return [];
    
    const distribution = [0, 0, 0, 0, 0];
    
    result.content.vulnerability.forEach(vuln => {
      const riskLevel = getRiskRating(vuln.impact || 0, vuln.likelihood || 0);
      if (riskLevel > 0 && riskLevel <= 5) {
        distribution[riskLevel - 1]++;
      }
    });
    
    return distribution;
  };

  const riskDistribution = getRiskDistribution();
  const lowVulnerabilities = riskDistribution[0] + riskDistribution[1] || 0;
  const mediumVulnerabilities = riskDistribution[2] || 0;
  const highVulnerabilities = riskDistribution[3] + riskDistribution[4] || 0;

  useEffect(() => {
    if (!result) {
      setLoading(true);
    } else if (loadingAssessment || loadingMatrix || loadingResults) {
      setLoading(true);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [result, loadingAssessment, loadingMatrix, loadingResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="p-8 rounded-lg bg-gray-800 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="p-8 rounded-lg bg-gray-800 shadow-lg border border-red-500 max-w-lg">
          <AlertTriangle className="text-red-500 h-12 w-12 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Results</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center mx-auto"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="p-8 rounded-lg bg-gray-800 shadow-lg border border-yellow-500 max-w-lg">
          <AlertTriangle className="text-yellow-500 h-12 w-12 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Result Not Found</h2>
          <p className="text-gray-300">The requested assessment result could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center mx-auto"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(result.status);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-9">
        <div>
          <h1 className="text-2xl font-bold text-white mb-4">Risk Assessment Result</h1>
          <div className="flex items-center gap-1">
            <span className={`flex items-center text-sm ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
            <Dot className="text-gray-400" />
            {assessment && (
            <span
              onClick={() => navigate(`/member/assessments/${result.assessment_id}`)}
              className="text-blue-400 hover:text-blue-300 transition cursor-pointer"
            >
              {assessment.name}
            </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:items-end">
          <div className="flex items-center text-white mb-3">
            <Calendar size={14} className="mr-2" />
            <span className="text-sm">{formatDate(result.created_at)}</span>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock size={14} className="mr-2" />
            <span>{getTimeAgo(result.created_at)}</span>
          </div>
        </div>
      </div>

      {result.status === 1 && (
      <>

      {result.content?.vulnerability && result.content.vulnerability.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

          <div className="bg-green-900/30 px-8 py-5 rounded-lg border border-green-900 flex items-center gap-5">
            <div>
              <p className="text-white font-medium text-sm mb-2.5">Low Risk Vulnerabilities</p>
              <p className="text-green-500 text-2xl font-bold">{lowVulnerabilities}</p>
            </div>
          </div>

          <div className="bg-yellow-900/30 px-8 py-5 rounded-lg border border-yellow-900 flex items-center gap-5">
            <div>
              <p className="text-white font-medium text-sm mb-2.5">Medium Risk Vulnerabilities</p>
              <p className="text-yellow-500 text-2xl font-bold">{mediumVulnerabilities}</p>
            </div>
          </div>

          <div className="bg-red-900/30 px-8 py-5 rounded-lg border border-red-900 flex items-center gap-5">
            <div>
              <p className="text-white font-medium text-sm mb-2.5">High Risk Vulnerabilities</p>
              <p className="text-red-500 text-2xl font-bold">{highVulnerabilities}</p>
            </div>
          </div>
        </div>
      )}

      {(!result.content?.vulnerability || result.content.vulnerability.length === 0) && (
        <div className="bg-green-900/20 px-8 py-10 rounded-lg border border-green-900 text-center">
          <CircleCheckBig className="text-green-400 h-16 w-16 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-green-300 mb-4">Congratulations</h2>
          <p className="text-white text-lg">No vulnerabilities were found in your assessment.</p>
          {result.content && result.content.summary && (
            <p className="text-gray-400 max-w-xl mx-auto mt-4">{result.content.summary}</p>
          )}
        </div>
      )}

      {(result.content?.vulnerability && result.content.vulnerability.length > 0) && (
        <div className="bg-gray-900 px-6 py-5 rounded-lg border border-gray-700 border-l-8 border-l-blue-400 mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Guidelines</h2>
          {result.content && result.content.summary ? (
            <p className="text-gray-300 whitespace-pre-wrap">{result.content.summary}</p>
          ) : (
            <p className="text-gray-500">No guidelines</p>
          )}
        </div>
      )}

      {result.content?.vulnerability && result.content.vulnerability.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">
              Vulnerabilities ({result.content.vulnerability.length})
            </h2>
            
            <button
              onClick={toggleAllVulnerabilities}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-md text-sm flex items-center gap-2.5 w-fit"
            >
              {showAllVulnerabilities ? (
                <>
                  <ChevronUp size={16} />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Expand All
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            {result.content.vulnerability.map((vuln, index) => {
              const currentRisk = getRiskRating(vuln.impact || 0, vuln.likelihood || 0);
              const residualRisk = getRiskRating(vuln.new_impact || 0, vuln.new_likelihood || 0);
              const isExpanded = showAllVulnerabilities || expandedVulnerability === index;
              
              return (
                <div 
                  key={index}
                  className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md`}
                >
                  <div 
                    className="p-5 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleVulnerability(index)}
                  >
                    <div className="">
                      <h3 className="font-semibold text-lg flex items-center gap-4 text-white">
                        {isExpanded ? 
                          <ChevronUp size={20} className="text-gray-400" /> : 
                          <ChevronDown size={20} className="text-gray-400" />
                        }
                        {vuln.name || `Vulnerability ${index + 1}`}
                      </h3>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(currentRisk)}`}>
                        {getRiskLabel(currentRisk)}
                      </div>
                      <MoveRight className="text-gray-400" />
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(residualRisk)}`}>
                        {getRiskLabel(residualRisk)}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-700 p-8 space-y-8 animate-fadeIn">

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 ">
                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="text-lg font-medium text-white text-center border-b border-gray-700 p-6">Current Risk</h4>
                          <div className="flex flex-col md:flex-row gap-8 items-center justify-center px-6 py-6">
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(vuln.impact || 0)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Impact</p>
                              <div className="font-medium">{getRiskLabel(vuln.impact || 0)}</div>
                            </div>
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(vuln.likelihood || 0)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Likelihood</p>
                              <div className="font-medium">{getRiskLabel(vuln.likelihood || 0)}</div>
                            </div>
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(currentRisk)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Risk rating</p>
                              <div className="font-medium">{getRiskLabel(currentRisk)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="text-lg font-medium text-white text-center border-b border-gray-700 p-6">Residual Risk</h4>
                          <div className="flex flex-col md:flex-row gap-8 items-center justify-center px-6 py-6">
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(vuln.new_impact || 0)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Impact</p>
                              <div className="font-medium">{getRiskLabel(vuln.new_impact || 0)}</div>
                            </div>
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(vuln.new_likelihood || 0)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Likelihood</p>
                              <div className="font-medium">{getRiskLabel(vuln.new_likelihood || 0)}</div>
                            </div>
                            <div className={`w-28 h-24 flex flex-col justify-center rounded-lg text-center ${getRiskColor(residualRisk)}`}>
                              <p className="font-medium text-sm text-gray-300 mb-2">Risk rating</p>
                              <div className="font-medium">{getRiskLabel(residualRisk)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                          {vuln.description ? (
                            <p className="text-gray-300 whitespace-pre-wrap">{vuln.description}</p>
                          ) : (
                            <p className="text-gray-500">No description</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">CVE</h4>
                          {vuln.cve && vuln.cve.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vuln.cve.map((cve, i) => (
                              <React.Fragment key={i}>
                              <a 
                                key={i}
                                href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline transition w-fit"
                              >
                                {cve}
                              </a>
                              </React.Fragment>
                            ))}
                          </div>
                          ) : (
                            <p className="text-gray-500">No CVE References</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">MITRE ATT&CK</h4>
                          {vuln.mitre && vuln.mitre.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vuln.mitre.map((mitre, i) => (
                              <React.Fragment key={i}>
                              <a 
                                key={i}
                                href={`https://attack.mitre.org/techniques/${mitre}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline transition w-fit"
                              >
                                {mitre}
                              </a>
                              </React.Fragment>
                            ))}
                          </div>
                          ) : (
                            <p className="text-gray-500">No MITRE ATT&CK References</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg border border-gray-700">
                          <h4 className="text-lg font-medium text-white border-b border-gray-700 p-6">Recommended Controls</h4>

                          {vuln.control && vuln.control.length > 0 ? (
                            <div>
                              {vuln.control.map((control, i) => (
                                <div
                                  key={i}
                                  className={`p-6 ${i !== (vuln.control ? vuln.control.length - 1 : 0) ? 'border-b border-gray-700' : ''}`}
                                >
                                  <div key={index} className="flex items-center mb-2.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                                    <p className="font-medium text-white">{control.name}</p>
                                  </div>

                                  {control.description && (
                                    <p className="text-gray-300 text-sm mb-4">{control.description}</p>
                                  )}
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {control.nist && (
                                      <div className="flex items-center">
                                        <span className="text-sm text-gray-400 mr-2">NIST SP 800-53:</span>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{control.nist}</span>
                                      </div>
                                    )}
                                    {control.iso && (
                                      <div className="flex items-center">
                                        <span className="text-sm text-gray-400 mr-2">ISO/IEC 27001:</span>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{control.iso}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-400 min-h-50">
                              <p>No recommended controls</p>
                            </div>
                          )}
                        </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.content?.vulnerability && result.content.vulnerability.length > 0 && (
        <div className="md:mb-10">
          <h2 className="text-xl font-semibold text-white mb-6">
            Summary
          </h2>
          
          <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
                <tr>
                  <th className="min-w-50 w-[28%] px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium relative"><span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">Vulnerability</span></th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-b border-gray-700 text-center text-gray-400 font-medium"></th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-b border-gray-700 text-center text-gray-400 font-medium">Current Risk</th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-r border-b border-gray-700 text-center text-gray-400 font-medium"></th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-b border-gray-700 text-center text-gray-400 font-medium"></th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-b border-gray-700 text-center text-gray-400 font-medium">Residual Risk</th>
                  <th className="min-w-30 w-[12%] px-4 py-6 border-b border-gray-700 text-center text-gray-400 font-medium"></th>
                </tr>
              </thead>
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium"></th>
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium">Impact</th>
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium">Likelihood</th>
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium">Risk rating</th>
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium">Impact</th>
                  <th className="px-4 py-6 border-r border-gray-700 text-center text-gray-400 font-medium">Likelihood</th>
                  <th className="px-4 py-6 text-center text-gray-400 font-medium">Risk rating</th>
                </tr>
              </thead>
              <tbody>
                {result.content.vulnerability.map((vuln, index) => {
                  const currentRisk = getRiskRating(vuln.impact || 0, vuln.likelihood || 0);
                  const residualRisk = getRiskRating(vuln.new_impact || 0, vuln.new_likelihood || 0);
                  const isLast = index === (result.content && result.content.vulnerability ? result.content.vulnerability.length - 1 : 0);
                  
                  return (
                    <tr 
                      key={index} 
                      className={`${isLast ? '' : 'border-b'} border-gray-700 hover:bg-gray-800 transition-colors`}
                    >
                      <td className="px-5 py-6 text-white border-r border-gray-700 max-w-100 truncate whitespace-nowrap overflow-hidden">
                        <span className="bg-gray-700 text-white text-sm px-2 py-0.5 rounded-full mr-3">{index + 1}</span>
                        {vuln.name || `Vulnerability ${index + 1}`}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 border-r border-gray-700 ${getRiskColor(vuln.impact || 0)}`}>
                        {getRiskLabel(vuln.impact || 0)}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 border-r border-gray-700 ${getRiskColor(vuln.likelihood || 0)}`}>
                        {getRiskLabel(vuln.likelihood || 0)}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 border-r border-gray-700 ${getRiskColor(currentRisk)}`}>
                        {getRiskLabel(currentRisk)}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 border-r border-gray-700 ${getRiskColor(vuln.new_impact || 0)}`}>
                        {getRiskLabel(vuln.new_impact || 0)}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 border-r border-gray-700 ${getRiskColor(vuln.new_likelihood || 0)}`}>
                        {getRiskLabel(vuln.new_likelihood || 0)}
                      </td>
                      <td className={`text-center font-medium px-4 py-6 ${getRiskColor(residualRisk)}`}>
                        {getRiskLabel(residualRisk)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.content?.vulnerability && result.content.vulnerability.length > 0 && (
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-white mb-6">
            Risk Matrix
          </h2>

          <div className="pl-6 pr-8 py-6 bg-gray-900 rounded-lg border border-gray-700">
            {renderRiskMatrix()}
          </div>
        </div>
      )}

      </>
      )}
      
      {result.status === 2 && (
        <div className="bg-gray-900 px-6 py-5 rounded-lg border border-gray-700 border-l-8 border-l-blue-400">
          <h2 className="text-xl font-semibold text-white mb-4">Recommendation</h2>
          {result.content && result.content.message ? (
            <p className="text-gray-300 whitespace-pre-wrap">{result.content.message}</p>
          ) : (
            <p className="text-gray-500">No recommendation</p>
          )}
        </div>
      )}

      {result.status === 2 && !hasCompletedResults && (
        <button
          onClick={() => navigate(`/member/assessments/${result.assessment_id}/edit`)}
          className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 mt-10"
        >
          <Pen size={18} />
          <span>Edit Assessment</span>
        </button>
      )}

    </div>
  );
};

export default ResultView;