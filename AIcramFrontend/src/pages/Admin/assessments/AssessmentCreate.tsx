import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface AssessmentFormData {
  user_id: string;
  name: string;
  status: 1 | 2;
  matrix_id: string;
  organization_id: string;
  situation: string;
  asset: string[];
  threat: string[];
  constraint: string;
}

const AssessmentCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

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
  
  const [formData, setFormData] = React.useState<AssessmentFormData>({
    user_id: '',
    name: '',
    status: 1,
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

    if (!formData.user_id) newErrors.user_id = 'User is required';

    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
    }

    if (!formData.status || (formData.status !== 1 && formData.status !== 2)) {
      newErrors.status = 'Status must be Active or Inactive';
    }

    if (!formData.situation) newErrors.situation = 'Situation is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'user_error' ||
            responseData.error === 'matrix_error' ||
            responseData.error === 'organization_error'
        ) {
          if (responseData.error === 'user_error') {
            setErrors((prev) => ({ ...prev, user_id: 'User not found' }));
          }

          if (responseData.error === 'matrix_error') {
            setErrors((prev) => ({ ...prev, matrix_id: 'Matrix not found' }));
          }

          if (responseData.error === 'organization_error') {
            setErrors((prev) => ({ ...prev, organization_id: 'Organization not found' }));
          }
        } else {
          throw new Error(responseData.error || 'Failed to create transaction');
        }
        return;
      }

      toast.success('Assessment created successfully');
      navigate('/admin/assessments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
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
        asset: 'Please select a asset' 
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

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Assessment</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2">User</label>
            <input
                type="text"
                value={formData.user_id}
                onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full border p-2 rounded"
            />
            {errors.user_id && <p className="text-red-500 text-sm mt-2">{errors.user_id}</p>}
          </div>

          <div>
            <label className="block mb-2">Name</label>
            <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-2">Status</label>
            <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) as 1 | 2 })}
                className="w-full border p-2 rounded"
            >
                <option value="1">Active</option>
                <option value="2">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-2">{errors.status}</p>}
          </div>
          
          <div>
            <label className="block mb-2">Matrix</label>
            <input
                type="text"
                value={formData.matrix_id}
                onChange={e => setFormData({ ...formData, matrix_id: e.target.value })}
                className="w-full border p-2 rounded"
            />
            {errors.matrix_id && <p className="text-red-500 text-sm mt-2">{errors.matrix_id}</p>}
          </div>

          <div>
            <label className="block mb-2">Organization</label>
            <input
                type="text"
                value={formData.organization_id}
                onChange={e => setFormData({ ...formData, organization_id: e.target.value })}
                className="w-full border p-2 rounded"
            />
            {errors.organization_id && <p className="text-red-500 text-sm mt-2">{errors.organization_id}</p>}
          </div>

          <div>
            <label className="block mb-2">Situation</label>
            <textarea
              value={formData.situation}
              onChange={e => setFormData({ ...formData, situation: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.situation && <p className="text-red-500 text-sm mt-2">{errors.situation}</p>}
          </div>

          <div>
            <label className="block mb-2">Assets</label>
            <div className="flex gap-2.5">
              <select
                value={newAsset}
                onChange={e => setNewAsset(e.target.value)}
                className="flex-grow border p-2 rounded"
              >
                <option value="">Select a asset</option>
                {assets.map((reg, index) => (
                  <option key={index} value={reg}>{reg}</option>
                ))}
                <option value="other">Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddAsset}
                className="bg-blue-500 text-white px-5 rounded hover:bg-blue-600"
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
                className="w-full border p-2 rounded mt-2.5"
              />
            )}
            
            {errors.asset && <p className="text-red-500 text-sm mt-2">{errors.asset}</p>}

            {formData.asset.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {formData.asset.map((reg, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm">{reg}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAsset(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2">Threats</label>
            <div className="flex gap-2.5">
              <select
                value={newThreat}
                onChange={e => setNewThreat(e.target.value)}
                className="flex-grow border p-2 rounded"
              >
                <option value="">Select a threat</option>
                {threats.map((reg, index) => (
                  <option key={index} value={reg}>{reg}</option>
                ))}
                <option value="other">Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddThreat}
                className="bg-blue-500 text-white px-5 rounded hover:bg-blue-600"
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
                className="w-full border p-2 rounded mt-2.5"
              />
            )}
            
            {errors.threat && <p className="text-red-500 text-sm mt-2">{errors.threat}</p>}

            {formData.threat.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {formData.threat.map((reg, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm">{reg}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveThreat(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2">Constraint</label>
            <textarea
              value={formData.constraint}
              onChange={e => setFormData({ ...formData, constraint: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.constraint && <p className="text-red-500 text-sm mt-2">{errors.constraint}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/assessments')}
              className="bg-gray-500 text-white px-4 py-2 mt-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default AssessmentCreate;