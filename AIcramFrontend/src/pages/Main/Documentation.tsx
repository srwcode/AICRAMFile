import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

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
  };

  const getMatrixLabels = () => {
    return {
      impact: ['Very Low', 'Low', 'Medium', 'High', 'Extreme'],
      likelihood: ['Extreme', 'High', 'Medium', 'Low', 'Very Low']
    };
  };

  const renderRiskMatrix = () => {
    const { impact, likelihood } = getMatrixLabels();
    const size = 5;

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-gray-900 backdrop-blur-md z-50 border-boxdark">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-4 px-4">
          <Link to="/">
            <div className="font-mono tracking-tight flex items-center scale-75">
              <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
              <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
              <span className="font-extrabold text-white text-4xl">M</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-grow bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 mb-8 hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>

          <h1 className="text-3xl font-bold text-white mb-8">Documentation</h1>
          
          <div className="bg-gray-800 rounded-lg shadow-sm p-8 space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Default Risk Matrix</h2>
              <p className="text-gray-400">
                The Risk Assessment Matrix presented below is designed in accordance with ISO 31000:2018 Risk Management Guidelines and provides a standardized framework for evaluating potential risks. This 5×5 matrix evaluates risks based on two key parameters: Impact (severity of consequences) and Likelihood (probability of occurrence). The intersection of these parameters yields a comprehensive risk rating that guides appropriate response strategies. This matrix facilitates consistent risk evaluation across all organizational activities and projects within AI-CRAM's operational framework.
              </p>
            </section>

            <div className="hidden md:block">
              <div className="pl-6 pr-8 py-6 bg-gray-900 rounded-lg border border-gray-700">
                {renderRiskMatrix()}
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-white mb-5">Impact Definitions</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Impact - Very Low</p>
                  </div>
                  <p className="text-gray-400">
                    Negligible consequences that can be resolved through normal operational processes. Financial impact is less than $10,000. No operational disruption occurs. No regulatory implications. No reputational damage. No impact on health, safety, or environmental concerns.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Impact - Low</p>
                  </div>
                  <p className="text-gray-400">
                    Minor consequences requiring minimal intervention. Financial impact between $10,000 and $50,000. Brief operational disruption of less than 24 hours. Minor regulatory implications with no penalties. Limited and short-term reputational impact. Minor and reversible health, safety, or environmental effects.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Impact - Medium</p>
                  </div>
                  <p className="text-gray-400">
                    Moderate consequences requiring coordinated response. Financial impact between $50,000 and $250,000. Operational disruption between 24-72 hours. Moderate regulatory implications with possible minor penalties. Noticeable reputational impact at the local level. Moderate, mostly reversible health, safety, or environmental effects.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Impact - High</p>
                  </div>
                  <p className="text-gray-400">
                    Significant consequences requiring extensive response. Financial impact between $250,000 and $1,000,000. Operational disruption between 3-7 days. Significant regulatory implications with probable penalties. Substantial reputational damage at regional or national level. Significant health, safety, or environmental effects that may have long-term implications.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Impact - Extreme</p>
                  </div>
                  <p className="text-gray-400">
                    Severe consequences threatening organizational viability. Financial impact exceeding $1,000,000. Operational disruption exceeding 7 days. Severe regulatory implications with substantial penalties and possible legal action. Severe, long-term reputational damage at national or international level. Critical health, safety, or environmental effects with potential permanent consequences.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-5">Likelihood Definitions</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Likelihood - Very Low</p>
                  </div>
                  <p className="text-gray-400">
                    Exceptional circumstances only; event would require a rare combination of factors to occur. Historical frequency: Less than once in 10 years. Probability of occurrence: Less than 5% within assessment period. Virtually unprecedented in the industry or operational context.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Likelihood - Low</p>
                  </div>
                  <p className="text-gray-400">
                    Uncommon but possible; event could occur under specific circumstances. Historical frequency: Once in 5-10 years. Probability of occurrence: 5-25% within assessment period. Has occurred infrequently in the industry or similar operational contexts.
                  </p>
                </div>

                <div>
                <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Likelihood - Medium</p>
                  </div>
                  <p className="text-gray-400">
                    Possible occurrence; event might occur at some point. Historical frequency: Once in 2-5 years. Probability of occurrence: 25-50% within assessment period. Has occurred occasionally in the industry or similar operational contexts.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Likelihood - High</p>
                  </div>
                  <p className="text-gray-400">
                    Probable occurrence; event will likely occur in most circumstances. Historical frequency: Once in 1-2 years. Probability of occurrence: 50-75% within assessment period. Has occurred regularly in the industry or similar operational contexts.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                    <p className="text-blue-400 font-bold">Likelihood - Extreme</p>
                  </div>
                  <p className="text-gray-400">
                    Almost certain occurrence; event is expected to occur in most circumstances. Historical frequency: Multiple times per year. Probability of occurrence: Greater than 75% within assessment period. Commonly occurs in the industry or operational context.
                  </p>
                </div>
              </div>
            </section>

            <div className="text-gray-400 pt-6 border-t border-gray-700">
              <p>Last updated: April 14, 2025</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;