import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { ChevronDown } from "lucide-react";

interface MatrixFormData {
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
}

const MatrixCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<MatrixFormData>({
    name: '',
    type: 1,
    description: '',
    impact_1: '',
    impact_2: '',
    impact_3: '',
    impact_4: '',
    impact_5: '',
    likelihood_1: '',
    likelihood_2: '',
    likelihood_3: '',
    likelihood_4: '',
    likelihood_5: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
    }

    if (!formData.type || (formData.type !== 1 && formData.type !== 2 && formData.type !== 3)) {
      newErrors.type = 'Type must be 3x3, 4x4, or 5x5';
    }

    if (formData.type === 1) {
      if (!formData.impact_2) newErrors.impact_2 = 'Low impact description is required';
      if (!formData.impact_3) newErrors.impact_3 = 'Medium impact description is required';
      if (!formData.impact_4) newErrors.impact_4 = 'High impact description is required';
    } else if (formData.type === 2) {
      if (!formData.impact_2) newErrors.impact_2 = 'Low impact description is required';
      if (!formData.impact_3) newErrors.impact_3 = 'Medium impact description is required';
      if (!formData.impact_4) newErrors.impact_4 = 'High impact description is required';
      if (!formData.impact_5) newErrors.impact_5 = 'Extreme impact description is required';
    } else if (formData.type === 3) {
      if (!formData.impact_1) newErrors.impact_1 = 'Very Low impact description is required';
      if (!formData.impact_2) newErrors.impact_2 = 'Low impact description is required';
      if (!formData.impact_3) newErrors.impact_3 = 'Medium impact description is required';
      if (!formData.impact_4) newErrors.impact_4 = 'High impact description is required';
      if (!formData.impact_5) newErrors.impact_5 = 'Extreme impact description is required';
    }
    
    if (formData.type === 1) {
      if (!formData.likelihood_2) newErrors.likelihood_2 = 'Low likelihood description is required';
      if (!formData.likelihood_3) newErrors.likelihood_3 = 'Medium likelihood description is required';
      if (!formData.likelihood_4) newErrors.likelihood_4 = 'High likelihood description is required';
    } else if (formData.type === 2) {
      if (!formData.likelihood_2) newErrors.likelihood_2 = 'Low likelihood description is required';
      if (!formData.likelihood_3) newErrors.likelihood_3 = 'Medium likelihood description is required';
      if (!formData.likelihood_4) newErrors.likelihood_4 = 'High likelihood description is required';
      if (!formData.likelihood_5) newErrors.likelihood_5 = 'Extreme likelihood description is required';
    } else if (formData.type === 3) {
      if (!formData.likelihood_1) newErrors.likelihood_1 = 'Very Low likelihood description is required';
      if (!formData.likelihood_2) newErrors.likelihood_2 = 'Low likelihood description is required';
      if (!formData.likelihood_3) newErrors.likelihood_3 = 'Medium likelihood description is required';
      if (!formData.likelihood_4) newErrors.likelihood_4 = 'High likelihood description is required';
      if (!formData.likelihood_5) newErrors.likelihood_5 = 'Extreme likelihood description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let dataImpact1;
    let dataImpact5;
    let dataLikelihood1;
    let dataLikelihood5;

    if (formData.type === 1) {
      dataImpact1 = '';
      dataImpact5 = '';
      dataLikelihood1 = '';
      dataLikelihood5 = '';
    } else if (formData.type === 2) {
      dataImpact1 = '';
      dataImpact5 = formData.impact_5;
      dataLikelihood1 = '';
      dataLikelihood5 = formData.likelihood_5;
    } else {
      dataImpact1 = formData.impact_1;
      dataImpact5 = formData.impact_5;
      dataLikelihood1 = formData.likelihood_1;
      dataLikelihood5 = formData.likelihood_5;
    }

    const dataToSubmit = {
      ...formData,
      status: 1,
      impact_1: dataImpact1,
      impact_5: dataImpact5,
      likelihood_1: dataLikelihood1,
      likelihood_5: dataLikelihood5
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/matrices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create matrix');
      }

      toast.success('Matrix created successfully');
      navigate('/member/matrices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create matrix');
      toast.error('Failed to create matrix');
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
    
    if (formData.type === 1) {
      const matrix3x3: Record<string, RiskLevel> = {
        "1,1": "low", "1,2": "low", "2,1": "low",
        "1,3": "medium", "2,2": "medium", "3,1": "medium",
        "2,3": "high", "3,2": "high", "3,3": "high"
      };
      return riskDefinitions[matrix3x3[key] || "medium"];
    }
    
    else if (formData.type === 2) {
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
    if (formData.type === 1) {
      return {
        impact: ['Low', 'Medium', 'High'],
        likelihood: ['High', 'Medium', 'Low']
      };
    } else if (formData.type === 2) {
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
    const size = formData.type === 1 ? 3 : formData.type === 2 ? 4 : 5;

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

  const inputClass = "w-full text-white bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-400 transition duration-150";

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
      <div className="border-b border-gray-700 px-6 py-4 lg:px-8 lg:py-6">
        <h1 className="text-2xl font-bold text-white">
          Create Matrix
        </h1>
      </div>
      
      <div className="p-6 lg:p-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <div className="text-white font-medium text-lg mb-4">
              Basic Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-gray-700">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="Enter matrix name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: Number(e.target.value) as 1 | 2 | 3 })}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="1">3x3 Matrix</option>
                    <option value="2">4x4 Matrix</option>
                    <option value="3">5x5 Matrix</option>
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                {errors.type && <p className="text-red-400 text-sm mt-2">{errors.type}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the risk assessment matrix"
                />
                {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="text-white font-medium text-lg mb-4">
              Matrix Visualization
            </div>
            <div className="pb-10 border-b border-gray-700">
              <p className="text-gray-300 mb-6">
                This is a preview of your risk assessment matrix.
              </p>
              <div className="bg-gray-900 rounded-lg pl-6 pr-8 py-6 border border-gray-700">
              {renderRiskMatrix()}
              </div>
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Impact Definitions
            </div>
            <div className="grid grid-cols-1 gap-6 pb-10 border-b border-gray-700">
              {formData.type === 3 && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Impact - Very Low</label>
                  <textarea
                    value={formData.impact_1}
                    onChange={e => setFormData({ ...formData, impact_1: e.target.value })}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Describe the very low impact level"
                  />
                  {errors.impact_1 && <p className="text-red-400 text-sm mt-1">{errors.impact_1}</p>}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Impact - Low</label>
                <textarea
                  value={formData.impact_2}
                  onChange={e => setFormData({ ...formData, impact_2: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the low impact level"
                />
                {errors.impact_2 && <p className="text-red-400 text-sm mt-1">{errors.impact_2}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Impact - Medium</label>
                <textarea
                  value={formData.impact_3}
                  onChange={e => setFormData({ ...formData, impact_3: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the medium impact level"
                />
                {errors.impact_3 && <p className="text-red-400 text-sm mt-1">{errors.impact_3}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Impact - High</label>
                <textarea
                  value={formData.impact_4}
                  onChange={e => setFormData({ ...formData, impact_4: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the high impact level"
                />
                {errors.impact_4 && <p className="text-red-400 text-sm mt-1">{errors.impact_4}</p>}
              </div>

              {(formData.type === 2 || formData.type === 3) && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Impact - Extreme</label>
                  <textarea
                    value={formData.impact_5}
                    onChange={e => setFormData({ ...formData, impact_5: e.target.value })}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Describe the extreme impact level"
                  />
                  {errors.impact_5 && <p className="text-red-400 text-sm mt-1">{errors.impact_5}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Likelihood Definitions
            </div>
            <div className="grid grid-cols-1 gap-6 pb-10 border-b border-gray-700">
              {formData.type === 3 && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Likelihood - Very Low</label>
                  <textarea
                    value={formData.likelihood_1}
                    onChange={e => setFormData({ ...formData, likelihood_1: e.target.value })}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Describe the very low likelihood level"
                  />
                  {errors.likelihood_1 && <p className="text-red-400 text-sm mt-1">{errors.likelihood_1}</p>}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Likelihood - Low</label>
                <textarea
                  value={formData.likelihood_2}
                  onChange={e => setFormData({ ...formData, likelihood_2: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the low likelihood level"
                />
                {errors.likelihood_2 && <p className="text-red-400 text-sm mt-1">{errors.likelihood_2}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Likelihood - Medium</label>
                <textarea
                  value={formData.likelihood_3}
                  onChange={e => setFormData({ ...formData, likelihood_3: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the medium likelihood level"
                />
                {errors.likelihood_3 && <p className="text-red-400 text-sm mt-1">{errors.likelihood_3}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Likelihood - High</label>
                <textarea
                  value={formData.likelihood_4}
                  onChange={e => setFormData({ ...formData, likelihood_4: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the high likelihood level"
                />
                {errors.likelihood_4 && <p className="text-red-400 text-sm mt-1">{errors.likelihood_4}</p>}
              </div>

              {(formData.type === 2 || formData.type === 3) && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Likelihood - Extreme</label>
                  <textarea
                    value={formData.likelihood_5}
                    onChange={e => setFormData({ ...formData, likelihood_5: e.target.value })}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Describe the extreme likelihood level"
                  />
                  {errors.likelihood_5 && <p className="text-red-400 text-sm mt-1">{errors.likelihood_5}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-white hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-all duration-200 font-medium"
            >
              Create Matrix
            </button>
            <button
              type="button"
              onClick={() => navigate('/member/matrices')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md border border-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatrixCreate;