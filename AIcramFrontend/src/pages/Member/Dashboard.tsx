import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import config from '../../config';
import { Grid3x3, Building, FileChartColumn, TextSearch } from 'lucide-react';

interface Matrix {
  matrix_id: string;
  name: string;
  type: 1 | 2 | 3;
}

interface Assessment {
  assessment_id: string;
  name: string;
  matrix_id: string;
  organization_id: string;
  created_at: string;
}

interface Result {
  result_id: string;
  assessment_id: string;
  status: number;
  created_at: string;
  content: {
    vulnerability?: { name?: string; description?: string; cve?: string[]; mitre?: string[] }[]
  };
}

interface DashboardStats {
  matrices: number;
  organizations: number;
  assessments: number;
  results: number;
  vulnerabilities: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    matrices: 0,
    organizations: 0,
    assessments: 0,
    results: 0,
    vulnerabilities: 0
  });
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [recentMatrices, setRecentMatrices] = useState<Matrix[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentNames, setAssessmentNames] = useState<{ [key: string]: string }>({});
  const [assessmentsCountMap, setAssessmentsCountMap] = useState<Record<string, number>>({});
  const [resultsCountMap, setResultsCountMap] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const statsPromises = [
          fetch(`${config.API_URL}/matrices?recordPerPage=1`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          }),
          fetch(`${config.API_URL}/organizations?recordPerPage=1`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          }),
          fetch(`${config.API_URL}/assessments?recordPerPage=1`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          }),
          fetch(`${config.API_URL}/results?recordPerPage=1`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          })
        ];

        const [matricesRes, orgsRes, assessmentsRes, resultsRes] = await Promise.all(statsPromises);
        
        const matrices = await matricesRes.json();
        const organizations = await orgsRes.json();
        const assessments = await assessmentsRes.json();
        const results = await resultsRes.json();
        
        let vulnerabilityCount = 0;
        if (results.result_items && results.result_items.length > 0) {
          const allResultsRes = await fetch(`${config.API_URL}/results?recordPerPage=9999`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          });
          const allResults = await allResultsRes.json();
          
          allResults.result_items.forEach((result: Result) => {
            if (result.status === 1 && result.content.vulnerability) {
              vulnerabilityCount += result.content.vulnerability.length;
            }
          });
        }
        
        setStats({
          matrices: matrices.total_count || 0,
          organizations: organizations.total_count || 0,
          assessments: assessments.total_count || 0,
          results: results.total_count || 0,
          vulnerabilities: vulnerabilityCount
        });
        
        const recentPromises = [
          fetch(`${config.API_URL}/matrices?recordPerPage=3`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          }),
          fetch(`${config.API_URL}/assessments?recordPerPage=3`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          }),
          fetch(`${config.API_URL}/results?recordPerPage=4`, {
            headers: { 'Content-Type': 'application/json', 'token': token || '' }
          })
        ];
        
        const [recentMatricesRes, recentAssessmentsRes, recentResultsRes] = await Promise.all(recentPromises);
        
        const matricesData = await recentMatricesRes.json();
        const assessmentsData = await recentAssessmentsRes.json();
        const resultsData = await recentResultsRes.json();
        
        setRecentMatrices(matricesData.matrix_items || []);
        setRecentAssessments(assessmentsData.assessment_items || []);
        setRecentResults(resultsData.result_items || []);
        
        if (resultsData.result_items && resultsData.result_items.length > 0) {
          const assessmentIds = resultsData.result_items
            .map((result: Result) => result.assessment_id)
            .filter((id: string) => id);
        
          const uniqueIds = [...new Set(assessmentIds)] as string[];
          const namesMap: { [key: string]: string } = {};
        
          await Promise.all(
            uniqueIds.map(async (id: string) => {
              try {
                const response = await fetch(`${config.API_URL}/assessments/${id}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'token': token || '',
                  },
                });
        
                if (response.ok) {
                  const data = await response.json();
                  namesMap[id] = data.name;
                }
              } catch (error) {
                console.error('Error fetching assessment name:', error);
              }
            })
          );
        
          setAssessmentNames(namesMap);
        }

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

        if (matricesData.matrix_items?.length > 0) {
          fetchAssessments();
        }

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
      
        if (assessmentsData.assessment_items?.length > 0) {
          fetchResults();
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
  };
  
  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <span className="bg-green-900/50 text-green-300 text-xs font-medium px-2.5 py-1.5 rounded">Completed</span>;
    }
    return <span className="bg-red-900/50 text-red-300 text-xs font-medium px-2.5 py-1.5 rounded">Failed</span>;
  };
  
  const getMatrixType = (type: number) => {
    if (type === 1) return '3x3';
    if (type === 2) return '4x4';
    if (type === 3) return '5x5';
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-white rounded-full"></div>
          <div className="h-3 w-3 bg-white rounded-full"></div>
          <div className="h-3 w-3 bg-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-gray-700 bg-gray-900 px-6 py-5 hover:bg-gray-900/50 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/member/assessments')}>
            <h2 className="text-gray-400 text-sm mb-2">Assessments</h2>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white">{stats.assessments}</div>
              <TextSearch className="w-8 h-8 ml-auto text-gray-400" />
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-700 bg-gray-900 px-6 py-5 hover:bg-gray-900/50 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/member/results')}>
            <h2 className="text-gray-400 text-sm mb-2">Results</h2>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white">{stats.results}</div>
              <FileChartColumn className="w-8 h-8 ml-auto text-gray-400" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 px-6 py-5 hover:bg-gray-900/50 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/member/organizations')}>
            <h2 className="text-gray-400 text-sm mb-2">Organizations</h2>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white">{stats.organizations}</div>
              <Building className="w-8 h-8 ml-auto text-gray-400" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 px-6 py-5 hover:bg-gray-900/50 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/member/matrices')}>
            <h2 className="text-gray-400 text-sm mb-2">Matrices</h2>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-white">{stats.matrices}</div>
              <Grid3x3 className="w-8 h-8 ml-auto text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-white">Recent Results</h2>
            <button
              onClick={() => navigate('/member/results')}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="hidden xl:flex xl:col-span-1 border border-gray-700 bg-gray-900 px-5 py-7.5 rounded-lg flex-col items-center justify-center">
              
              <div className="flex items-center justify-center mb-5">
                <div className="w-36 h-36 rounded-full border-8 border-gray-700 flex flex-col gap-2 items-center justify-center">
                  <div className="text-4xl font-bold text-white">{stats.vulnerabilities}</div>
                  <div className="text-xs text-gray-400">Vuln</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">Detected across all results</div>
            </div>

            <div className="xl:col-span-3">
              <div className="max-w-full overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-900 text-left">
                      <th className="w-[30%] py-3 px-6 text-sm font-medium text-gray-300">Created</th>
                      <th className="w-[25%] py-3 px-6 text-sm font-medium text-gray-300">Assessment</th>
                      <th className="w-[25%] py-3 px-6 text-sm font-medium text-gray-300">Status</th>
                      <th className="w-[20%] py-3 px-6 text-sm font-medium text-gray-300">Vulnerability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-22 text-gray-400">No recent result</td>
                      </tr>
                    ) : (
                      recentResults.map(result => (
                        <tr key={result.result_id}
                          className="hover:bg-gray-900/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/member/results/${result.result_id}`)}
                        >
                          <td className="py-3 px-6 text-gray-300">
                            {formatDate(result.created_at)}
                          </td>
                          <td className="py-3 px-6 text-gray-300">
                            {result.assessment_id ? (
                              <p className="max-w-40 truncate whitespace-nowrap overflow-hidden">
                                {assessmentNames[result.assessment_id] || 'Unknown Assessment'}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">No assessment</p>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            {getStatusBadge(result.status)}
                          </td>
                          <td className="py-3 px-6">
                            {result.status === 1 ? (
                              <span>
                              {result.content.vulnerability && (
                                <span className="bg-gray-900 text-gray-300 text-sm px-2 py-1 rounded">
                                  {result.content.vulnerability.length || 0}
                                </span>
                              )}
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-8">
        <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Assessments</h2>
            <button
              onClick={() => navigate('/member/assessments')}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentAssessments.length === 0 ? (
              <p className="text-center py-25 text-gray-400">No assessments found</p>
            ) : (
              recentAssessments.map(assessment => (
                <div 
                  key={assessment.assessment_id}
                  className="flex items-center gap-4 px-5 py-4 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/member/assessments/${assessment.assessment_id}`)}
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{assessment.name}</h3>
                    <p className="text-gray-400 text-sm">{formatDate(assessment.created_at)}</p>
                  </div>
                  <span className="bg-gray-800 text-gray-300 text-sm px-2 py-1 rounded">
                    {resultsCountMap[assessment.assessment_id] || 0} Results
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Risk Matrices</h2>
            <button
              onClick={() => navigate('/member/matrices')}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentMatrices.length === 0 ? (
              <p className="text-center py-25 text-gray-400">No matrices found</p>
            ) : (
              recentMatrices.map(matrix => (
                <div 
                  key={matrix.matrix_id}
                  className="flex items-center gap-4 px-5 py-4 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/member/matrices/${matrix.matrix_id}`)}
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{matrix.name}</h3>
                    <p className="text-gray-400 text-sm">{getMatrixType(matrix.type)} Matrix</p>
                  </div>
                  <span className="bg-gray-800 text-gray-300 text-sm px-2 py-1 rounded">
                    {assessmentsCountMap[matrix.matrix_id] || 0} Assessments
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;