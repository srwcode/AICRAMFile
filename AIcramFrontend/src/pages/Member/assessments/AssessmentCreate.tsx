import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { ChevronDown, ChevronRight, ChevronLeft, Check, AlertCircle, Sparkle, Loader } from "lucide-react";

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

interface Organization {
  organization_id: string;
  name: string;
  description: string;
  industry: string;
  employees: number;
  customers: number;
  revenue: number;
  country: string;
  regulation: string[];
  asset: Asset[];
  structure: string;
  architecture: string;
  measure: string;
  constraint: string;
}

interface Asset {
  name: string;
  value: number;
  criticality: 1 | 2 | 3 | 4 | 5;
}

interface ResultContent {
  success: 1 | 2;
  vulnerability: Vulnerability[];
  summary: string;
  message: string;
}

interface Vulnerability {
  name: string;
  description: string;
  cve: string[];
  mitre: string[];
  impact: number;
  likelihood: number;
  new_impact: number;
  new_likelihood: number;
  control: Control[];
}

interface Control {
  name: string;
  description: string;
  nist?: string | null;
  iso?: string | null;
}

const AssessmentCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingMatrices, setLoadingMatrices] = useState(true);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
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

  const validateCurrentStep = () => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1:
        if (!formData.situation) newErrors.situation = 'Situation is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.situation) newErrors.situation = 'Situation is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const contentData = async () => {
    try {
      const contentData: any = {
        situation: formData.situation,
        asset: formData.asset,
        threat: formData.threat,
        constraint: formData.constraint
      };
      
      if (formData.matrix_id) {
        const selectedMatrix = matrices.find(m => m.matrix_id === formData.matrix_id);
        if (selectedMatrix) {

          let matrixType;

          if(selectedMatrix.type === 1) {
            matrixType = "3x3";
          } else if (selectedMatrix.type === 2) {
            matrixType = "4x4";
          } else if (selectedMatrix.type === 3) {
            matrixType = "5x5";
          }

          contentData.matrix = [{
            name: selectedMatrix.name,
            description: selectedMatrix.description,
            type: matrixType
          }];

          if (selectedMatrix.type === 3) {
            contentData.matrix[0].impact_very_low = selectedMatrix.impact_1;
          }

          contentData.matrix[0].impact_low = selectedMatrix.impact_2;
          contentData.matrix[0].impact_medium = selectedMatrix.impact_3;
          contentData.matrix[0].impact_high = selectedMatrix.impact_4;
          
          if (selectedMatrix.type === 2 || selectedMatrix.type === 3) {
            contentData.matrix[0].impact_extreme = selectedMatrix.impact_5;
          }

          if (selectedMatrix.type === 3) {
            contentData.matrix[0].likelihood_very_low = selectedMatrix.likelihood_1;
          }

          contentData.matrix[0].likelihood_low = selectedMatrix.likelihood_2;
          contentData.matrix[0].likelihood_medium = selectedMatrix.likelihood_3;
          contentData.matrix[0].likelihood_high = selectedMatrix.likelihood_4;

          if (selectedMatrix.type === 2 || selectedMatrix.type === 3) {
            contentData.matrix[0].likelihood_extreme = selectedMatrix.likelihood_5;
          }

        }
      }
      
      if (formData.organization_id) {
        const selectedOrg = organizations.find(o => o.organization_id === formData.organization_id);
        if (selectedOrg) {
          contentData.organization = [{
            name: selectedOrg.name,
            description: selectedOrg.description,
            industry: selectedOrg.industry,
            employees: selectedOrg.employees,
            customers: selectedOrg.customers,
            revenue: selectedOrg.revenue,
            regulation: selectedOrg.regulation,
            asset: selectedOrg.asset.map(asset => ({
              name: asset.name,
              value: asset.value,
              criticality: asset.criticality
            })),
            structure: selectedOrg.structure,
            architecture: selectedOrg.architecture,
            measure: selectedOrg.measure,
            constraint: selectedOrg.constraint
          }];
        }
      }

      console.log("Data input:\n", JSON.stringify(contentData, null, 2));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/results/contents`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(contentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create content');
      }
      
      const responseData: ResultContent = await response.json();

      const orderedResponse = {
        success: responseData.success,
        vulnerability: responseData.vulnerability,
        summary: responseData.summary,
        message: responseData.message
      };
      
      console.log("Data output:\n", JSON.stringify(orderedResponse, null, 2));

      return responseData;
      
    } catch (err) {
      console.error("Error creating content:", err);
      throw err;
    }
  };

  const createResult = async (assessmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const contentResponse = await contentData();
      
      let resultContent: ResultContent;
      
      if (contentResponse) {
        resultContent = {
          success: contentResponse.success,
          vulnerability: contentResponse.vulnerability,
          summary: contentResponse.summary,
          message: contentResponse.message
        };
      } else {
        resultContent = {
          success: 2,
          vulnerability: [],
          summary: "",
          message: "No result content"
        };
      }

      if (!validateResultContent(resultContent)) {
        throw new Error('Invalid result content');
      }
      
      const resultStatus = resultContent.success === 1 ? 1 : 2;
      
      const resultData = {
        status: resultStatus,
        assessment_id: assessmentId,
        content: resultContent
      };
      
      const response = await fetch(`${config.API_URL}/results`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(resultData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create result');
      }
      
      const responseData = await response.json();
      return responseData.result_id;
      
    } catch (err) {
      console.error("Error creating result:", err);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  const validateResultContent = (content: any): content is ResultContent => {

    if (content.success === undefined || content.success === null || ![1, 2].includes(content.success)) {
      return false;
    }
    
    if (content.summary === undefined || content.summary === null || typeof content.summary !== 'string') {
      return false;
    }
    
    if (content.message === undefined || content.message === null || typeof content.message !== 'string') {
      return false;
    }
    
    if (!Array.isArray(content.vulnerability)) {
      return false;
    }
    
    for (let i = 0; i < content.vulnerability.length; i++) {
      const vul = content.vulnerability[i];
      
      if (!vul.name || typeof vul.name !== 'string') {
        return false;
      }
      
      if (!vul.description || typeof vul.description !== 'string') {
        return false;
      }
      
      if (!Array.isArray(vul.cve)) {
        return false;
      }
      
      if (!Array.isArray(vul.mitre)) {
        return false;
      }
      
      if (vul.impact === undefined || vul.impact === null || 
          ![0, 1, 2, 3, 4, 5].includes(vul.impact)) {
        return false;
      }
      
      if (vul.likelihood === undefined || vul.likelihood === null || 
          ![0, 1, 2, 3, 4, 5].includes(vul.likelihood)) {
        return false;
      }
      
      if (vul.new_impact === undefined || vul.new_impact === null || 
          ![0, 1, 2, 3, 4, 5].includes(vul.new_impact)) {
        return false;
      }
      
      if (vul.new_likelihood === undefined || vul.new_likelihood === null || 
          ![0, 1, 2, 3, 4, 5].includes(vul.new_likelihood)) {
        return false;
      }
      
      if (!Array.isArray(vul.control)) {
        return false;
      }
      
      for (let j = 0; j < vul.control.length; j++) {
        const ctrl = vul.control[j];
        
        if (!ctrl.name || typeof ctrl.name !== 'string') {
          return false;
        }
        
        if (!ctrl.description || typeof ctrl.description !== 'string') {
          return false;
        }
        
        if (ctrl.nist !== undefined && ctrl.nist !== null && typeof ctrl.nist !== 'string') {
          return false;
        }
        
        if (ctrl.iso !== undefined && ctrl.iso !== null && typeof ctrl.iso !== 'string') {
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setAnalyzing(true);

    try {
      const token = localStorage.getItem('token');
      
      const dataToSubmit = {
        ...formData,
        status: 1
      };

      if (!dataToSubmit.name || dataToSubmit.name.trim() === '') {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        dataToSubmit.name = `Assessment - ${day}/${month}/${year} (${hours}:${minutes})`;
      }

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
            setCurrentStep(2);
          }

          if (responseData.error === 'organization_error') {
            setErrors((prev) => ({ ...prev, organization_id: 'Organization not found' }));
            setCurrentStep(3);
          }

          setAnalyzing(false);

        } else {
          throw new Error(responseData.error || 'Failed to create assessment');
        }
        return;
      } else {

        const assessmentId = responseData.assessment_id;

        if(assessmentId) {
          const resultId = await createResult(assessmentId);

          if(resultId) {
            toast.success('Result created successfully');
            navigate(`/member/results/${resultId}`);
          } else {
            toast.success('Assessment created successfully');
            navigate(`/member/assessments/${assessmentId}`);
          }
        }
        
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
      setAnalyzing(false);
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
      const created = { ...prev };
      delete created.asset;
      return created;
    });
  };

  const handleRemoveAsset = (index: number) => {
    const createdAssets = [...formData.asset];
    createdAssets.splice(index, 1);
    setFormData({
      ...formData,
      asset: createdAssets
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
      const created = { ...prev };
      delete created.threat;
      return created;
    });
  };

  const handleRemoveThreat = (index: number) => {
    const createdThreats = [...formData.threat];
    createdThreats.splice(index, 1);
    setFormData({
      ...formData,
      threat: createdThreats
    });
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepStatus = (step: number) => {
    if (step === currentStep) return 'current';
    if (step < currentStep) return 'completed';
    return 'upcoming';
  };

  const inputClass = "w-full text-white bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-400 transition duration-150";
  const buttonClass = "flex items-center justify-center px-6 py-2.5 rounded-md transition-all duration-200 font-medium";

  if (loadingMatrices || loadingOrganizations) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg p-8">
        <div className="flex items-center justify-center h-32">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="flex items-center mb-6">
            <Loader size={36} className="text-blue-500 animate-spin mr-4" />
            <h2 className="text-2xl font-semibold text-white">Analyzing...</h2>
          </div>
          <div className="space-y-4 max-w-md">
            <p className="text-gray-300 text-center leading-relaxed">
              Our AI is analyzing your situation to identify potential vulnerabilities 
              and suggest effective mitigation controls.
            </p>
            <p className="text-blue-300/80 text-center font-medium">
              This might take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
      <div className="border-b border-gray-700 px-6 py-4 lg:px-8 lg:py-6">
        <h1 className="text-2xl font-bold text-white">
          New Assessment
        </h1>
      </div>
      
      <div className="hidden md:block px-6 py-4 lg:px-10 lg:py-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            
            return (
              <React.Fragment key={step}>
                <div className="w-10 flex flex-col items-center relative">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      status === 'current' ? 'border-blue-500 text-blue-500' :
                      status === 'completed' ? 'border-green-500 bg-green-500 text-white' :
                      'border-gray-600 text-gray-400'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check size={20} />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs ${
                    status === 'current' ? 'text-blue-500 font-medium' :
                    status === 'completed' ? 'text-green-500' :
                    'text-gray-400'
                  }`}>
                    {step === 1 && 'Situation'}
                    {step === 2 && 'Organization'}
                    {step === 3 && 'Matrix'}
                    {step === 4 && 'Assets'}
                    {step === 5 && 'Threats'}
                    {step === 6 && 'Constraints'}
                    {step === 7 && 'Summary'}
                  </span>
                </div>
                
                {step < totalSteps && (
                  <div 
                    className={`flex-1 h-0.5 mb-6 ${
                      status === 'upcoming' ? 'bg-gray-600' :
                      step < currentStep ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Situation <span className="text-sm font-normal text-red-400">*</span></h2>
              
              <div className="space-y-6">
                <div>
                  <textarea
                    value={formData.situation}
                    onChange={e => setFormData({ ...formData, situation: e.target.value })}
                    className={inputClass + " h-40 resize-none"}
                    placeholder="Describe the situation"
                  />
                  {errors.situation && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.situation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Name <span className="text-gray-400">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="Enter assessment name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Organization</h2>
              
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
              {errors.organization_id && (
                <p className="text-red-400 text-sm mt-4 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.organization_id}
                </p>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Matrix</h2>
              
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
              {errors.matrix_id && (
                <p className="text-red-400 text-sm mt-4 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.matrix_id}
                </p>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Assets</h2>
              
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
          )}

          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Threats</h2>
              
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
          )}

          {currentStep === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Constraints</h2>
              
              <div>
                <textarea
                  value={formData.constraint}
                  onChange={e => setFormData({ ...formData, constraint: e.target.value })}
                  className={inputClass + " h-40 resize-none"}
                  placeholder="Describe any business or technical constraints"
                />
                {errors.constraint && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.constraint}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-white">Summary</h2>
              
              <div className="space-y-4">
                <div className="flex">
                  <span className="text-gray-400 w-32">Name:</span>
                  <span className="text-white">{formData.name || <span className="text-sm text-gray-400">Not provided</span>}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-400 w-32">Matrix:</span>
                  <span className="text-white">
                    {matrices.find(m => m.matrix_id === formData.matrix_id)?.name || <span className="text-sm text-gray-400">Default</span>}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-400 w-32">Organization:</span>
                  <span className="text-white">
                    {organizations.find(o => o.organization_id === formData.organization_id)?.name || <span className="text-sm text-gray-400">Not selected</span>}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-400 w-32">Assets:</span>
                  <div className="flex-1">
                    {formData.asset.length > 0 ? (
                      <div className="flex flex-wrap gap-x-2 gap-y-2">
                        {formData.asset.map((asset, index) => (
                          <span key={index} className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded">
                            {asset}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not selected</span>
                    )}
                  </div>
                </div>
                
                <div className="flex">
                  <span className="text-gray-400 w-32">Threats:</span>
                  <div className="flex-1">
                    {formData.threat.length > 0 ? (
                      <div className="flex flex-wrap gap-x-2 gap-y-2">
                        {formData.threat.map((threat, index) => (
                          <span key={index} className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded">
                            {threat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not selected</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-400 block mb-2.5">Situation</span>
                  <div className="bg-gray-800 px-5 py-4 rounded border border-gray-700 text-gray-300 text-sm whitespace-pre-wrap">
                    {formData.situation || <span className="text-sm text-gray-400">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-400 block mb-2.5">Constraints</span>
                  <div className="bg-gray-800 px-5 py-4 rounded border border-gray-700 text-gray-300 text-sm whitespace-pre-wrap">
                    {formData.constraint || <span className="text-sm text-gray-400">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className={`${buttonClass} ${currentStep > 1 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white cursor-not-allowed opacity-50'}`}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={18} className="mr-2" />
              Previous
            </button>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/member/assessments')}
                className={`${buttonClass} hidden md:block bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white`}
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`${buttonClass} bg-white hover:bg-gray-300 text-gray-800`}
                >
                  Next
                  <ChevronRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className={`${buttonClass} bg-white hover:bg-gray-300 text-gray-800`}
                >
                  <Sparkle size={18} className="mr-2" />
                  Analyze
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentCreate;