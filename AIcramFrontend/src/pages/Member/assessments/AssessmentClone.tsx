import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { ChevronDown } from "lucide-react";

interface AssessmentFormData {
  name: string;
  matrix_id: string;
  organization_id: string;
  situation: string;
  asset: string[];
  threat: string[];
  constraint: string;
}

interface Matrix {
  matrix_id: string;
  name: string;
  type: number;
}

interface Organization {
  organization_id: string;
  name: string;
  industry: string;
}

const AssessmentClone = () => {
  const { assessment_id } = useParams<{ assessment_id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingMatrices, setLoadingMatrices] = useState(true);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  
  const [newAsset, setNewAsset] = useState<string>('');
  const [otherAsset, setOtherAsset] = useState<string>('');
  const assets = [
    "Sensitive Data",
    "User Credentials",
    "Encryption Keys",
    "Servers",
    "Network Infrastructure",
    "Endpoints",
    "Cloud Resources",
    "Databases",
    "Web Applications",
    "APIs",
    "IoT Devices",
    "Software Source Code",
    "Backup Systems"
  ];

  const [newThreat, setNewThreat] = useState<string>('');
  const [otherThreat, setOtherThreat] = useState<string>('');
  const threats = [
    "Data Breaches",
    "Unauthorized Access",
    "Credential Management",
    "Social Engineering",
    "Malware Attacks",
    "Insider Threats",
    "DDoS Attacks",
    "Third-Party Risks",
    "Unpatched Software",
    "Misconfigured Security Settings",
    "Compliance and Regulatory Violations",
    "Lack of Incident Response Plans",
    "Zero-Day Vulnerabilities"
  ];

  const [formData, setFormData] = useState<AssessmentFormData>({
    name: '',
    matrix_id: '',
    organization_id: '',
    situation: '',
    asset: [],
    threat: [],
    constraint: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchResultsAndAssessment = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const assessmentResponse = await fetch(`${config.API_URL}/assessments/${assessment_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!assessmentResponse.ok) throw new Error('Failed to fetch assessment');
        const assessmentData = await assessmentResponse.json();
        
        setFormData({
          name: "Clone " + assessmentData.name,
          matrix_id: assessmentData.matrix_id,
          organization_id: assessmentData.organization_id,
          situation: assessmentData.situation,
          asset: assessmentData.asset || [],
          threat: assessmentData.threat || [],
          constraint: assessmentData.constraint
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResultsAndAssessment();
  }, [assessment_id]);

  useEffect(() => {
    const fetchMatrices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/matrices?page=1&recordPerPage=100`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setMatrices([]);
          return;
        }
  
        const data = await response.json();
        setMatrices(data.matrix_items || []);
      } catch (err) {
        setMatrices([]);
      } finally {
        setLoadingMatrices(false);
      }
    };
    
    fetchMatrices();
  }, []);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_URL}/organizations?page=1&recordPerPage=100`, {
          headers: {
            'Content-Type': 'application/json',
            'token': token || ''
          }
        });
        
        if (!response.ok) {
          setOrganizations([]);
          return;
        }
  
        const data = await response.json();
        setOrganizations(data.organization_items || []);
      } catch (err) {
        setOrganizations([]);
      } finally {
        setLoadingOrganizations(false);
      }
    };
    
    fetchOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      
      const dataToSubmit = {
        ...formData,
        status: 1
      };

      const response = await fetch(`${config.API_URL}/assessments`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'matrix_error' ||
            responseData.error === 'organization_error'
        ) {
          if (responseData.error === 'matrix_error') {
            setErrors((prev) => ({ ...prev, matrix_id: 'Matrix not found' }));
          }

          if (responseData.error === 'organization_error') {
            setErrors((prev) => ({ ...prev, organization_id: 'Organization not found' }));
          }
        } else {
          throw new Error(responseData.error || 'Failed to clone assessment');
        }
        return;
      } else {
        toast.success('Assessment cloned successfully');
        navigate(`/member/assessments/${responseData.assessment_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone assessment');
    }
  };

  const handleMatrixSelection = (matrixId: string) => {
    if (formData.matrix_id === matrixId) {
      setFormData({ ...formData, matrix_id: '' });
    } else {
      setFormData({ ...formData, matrix_id: matrixId });
    }
  };

  const handleOrganizationSelection = (organizationId: string) => {
    if (formData.organization_id === organizationId) {
      setFormData({ ...formData, organization_id: '' });
    } else {
      setFormData({ ...formData, organization_id: organizationId });
    }
  };

  const handleAddAsset = () => {
    if (newAsset === 'other' && !otherAsset) {
      setErrors((prev) => ({ 
        ...prev, 
        asset: 'Please specify the asset' 
      }));
      return;
    }
    
    const assetToAdd = newAsset === 'other' ? otherAsset : newAsset;
    
    if (!assetToAdd) {
      setErrors((prev) => ({ 
        ...prev, 
        asset: 'Please select an asset' 
      }));
      return;
    }
    
    if (formData.asset.includes(assetToAdd)) {
      setErrors((prev) => ({ 
        ...prev, 
        asset: 'This asset is already added' 
      }));
      return;
    }
    
    setFormData({
      ...formData,
      asset: [...formData.asset, assetToAdd]
    });
    
    setNewAsset('');
    setOtherAsset('');
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.asset;
      return updated;
    });
  };

  const handleRemoveAsset = (index: number) => {
    const updatedAssets = [...formData.asset];
    updatedAssets.splice(index, 1);
    setFormData({
      ...formData,
      asset: updatedAssets
    });
  };

  const handleAddThreat = () => {
    if (newThreat === 'other' && !otherThreat) {
      setErrors((prev) => ({ 
        ...prev, 
        threat: 'Please specify the threat' 
      }));
      return;
    }
    
    const threatToAdd = newThreat === 'other' ? otherThreat : newThreat;
    
    if (!threatToAdd) {
      setErrors((prev) => ({ 
        ...prev, 
        threat: 'Please select a threat' 
      }));
      return;
    }
    
    if (formData.threat.includes(threatToAdd)) {
      setErrors((prev) => ({ 
        ...prev, 
        threat: 'This threat is already added' 
      }));
      return;
    }
    
    setFormData({
      ...formData,
      threat: [...formData.threat, threatToAdd]
    });
    
    setNewThreat('');
    setOtherThreat('');
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.threat;
      return updated;
    });
  };

  const handleRemoveThreat = (index: number) => {
    const updatedThreats = [...formData.threat];
    updatedThreats.splice(index, 1);
    setFormData({
      ...formData,
      threat: updatedThreats
    });
  };

  const inputClass = "w-full text-white bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-400 transition duration-150";

  if (loading || loadingMatrices || loadingOrganizations) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
      <div className="border-b border-gray-700 px-6 py-4 lg:px-8 lg:py-6">
        <h1 className="text-2xl font-bold text-white">
          Clone Assessment
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
            <div className="pb-10 border-b border-gray-700 space-y-8">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="Enter assessment name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-3 text-sm">Organization</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-2">
                  {organizations.length === 0 ? (
                    <p className="text-gray-400">No organizations found</p>
                  ) : (
                    organizations.map((organization) => (
                      <div 
                        key={organization.organization_id}
                        onClick={() => handleOrganizationSelection(organization.organization_id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition duration-150 ${
                          formData.organization_id === organization.organization_id 
                            ? 'border-blue-400 bg-blue-900/20 hover:border-blue-500 hover:bg-blue-900/25' 
                            : 'bg-gray-900 border-gray-700 hover:border-gray-600 hover:bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div>
                            <h3 className="font-medium text-white mb-1.5">{organization.name}</h3>
                            <p className="text-sm text-gray-400">{organization.industry}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {errors.organization_id && <p className="text-red-400 text-sm mt-2">{errors.organization_id}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-3 text-sm">Matrix</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-2">
                  {matrices.length === 0 ? (
                    <p className="text-gray-400">No matrices found</p>
                  ) : (
                    matrices.map((matrix) => (
                      <div 
                        key={matrix.matrix_id}
                        onClick={() => handleMatrixSelection(matrix.matrix_id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition duration-150 ${
                          formData.matrix_id === matrix.matrix_id 
                            ? 'border-blue-400 bg-blue-900/20 hover:border-blue-500 hover:bg-blue-900/25' 
                            : 'bg-gray-900 border-gray-700 hover:border-gray-600 hover:bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div>
                            <h3 className="font-medium text-white mb-1.5">{matrix.name}</h3>
                            <p className="text-sm text-gray-400">
                              {matrix.type === 1 ? (
                                <span>3x3</span>
                              ) : matrix.type === 2 ? (
                                <span>4x4</span>
                              ) : matrix.type === 3 ? (
                                <span>5x5</span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {errors.matrix_id && <p className="text-red-400 text-sm mt-2">{errors.matrix_id}</p>}
              </div>
              
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Situation information
            </div>
            <div className="pb-10 border-b border-gray-700 space-y-5">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Situation <span className="text-red-400">*</span></label>
                <textarea
                  value={formData.situation}
                  onChange={e => setFormData({ ...formData, situation: e.target.value })}
                  className={inputClass + " h-32 resize-none"}
                  placeholder="Describe the current situation"
                />
                {errors.situation && <p className="text-red-400 text-sm mt-2">{errors.situation}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Constraints</label>
                <textarea
                  value={formData.constraint}
                  onChange={e => setFormData({ ...formData, constraint: e.target.value })}
                  className={inputClass + " h-32 resize-none"}
                  placeholder="Describe any constraints"
                />
                {errors.constraint && <p className="text-red-400 text-sm mt-2">{errors.constraint}</p>}
              </div>
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Assets
            </div>
            <div className="pb-10 border-b border-gray-700">
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="relative flex-grow">
                  <select
                    value={newAsset}
                    onChange={e => setNewAsset(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select an asset</option>
                    {assets.map((asset, index) => (
                      <option key={index} value={asset}>{asset}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                <button
                  type="button"
                  onClick={handleAddAsset}
                  className={`bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md border border-gray-600 transition-colors`}
                >
                  Add
                </button>
              </div>
              
              {newAsset === 'other' && (
                <input
                  type="text"
                  value={otherAsset}
                  onChange={e => setOtherAsset(e.target.value)}
                  placeholder="Specify asset"
                  className={`${inputClass} mt-4`}
                />
              )}
              
              {errors.asset && <p className="text-red-400 text-sm mt-2">{errors.asset}</p>}

              {formData.asset.length > 0 && (
                <div className="mt-5">
                  <div className="flex flex-wrap gap-x-2.5 gap-y-4">
                    {formData.asset.map((asset, index) => (
                      <div key={index} className="flex items-center bg-gray-900 border border-gray-600 px-4 py-2 rounded-full">
                        <span className="ml-1.5 text-sm text-white">{asset}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAsset(index)}
                            className="ml-2.5 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Threats
            </div>
            <div className="pb-10 border-b border-gray-700">
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="relative flex-grow">
                  <select
                    value={newThreat}
                    onChange={e => setNewThreat(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select a threat</option>
                    {threats.map((threat, index) => (
                      <option key={index} value={threat}>{threat}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                <button
                  type="button"
                  onClick={handleAddThreat}
                  className={`bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md border border-gray-600 transition-colors`}
                >
                  Add
                </button>
              </div>
              
              {newThreat === 'other' && (
                <input
                  type="text"
                  value={otherThreat}
                  onChange={e => setOtherThreat(e.target.value)}
                  placeholder="Specify threat"
                  className={`${inputClass} mt-4`}
                />
              )}
              
              {errors.threat && <p className="text-red-400 text-sm mt-2">{errors.threat}</p>}

              {formData.threat.length > 0 && (
                <div className="mt-5">
                  <div className="flex flex-wrap gap-x-2.5 gap-y-4">
                    {formData.threat.map((threat, index) => (
                      <div key={index} className="flex items-center bg-gray-900 border border-gray-600 px-4 py-2 rounded-full">
                        <span className="ml-1.5 text-sm text-white">{threat}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveThreat(index)}
                            className="ml-2.5 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-white hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-all duration-200 font-medium"
            >
              Clone
            </button>
            <button
              type="button"
              onClick={() => navigate('/member/assessments')}
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

export default AssessmentClone;