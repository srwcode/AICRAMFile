import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface Asset {
  name: string;
  value: GLfloat;
  criticality: 1 | 2 | 3 | 4 | 5;
}

interface OrganizationFormData {
  user_id: string;
  name: string;
  status: 1 | 2;
  description: string;
  industry: string;
  employees: number;
  customers: number;
  revenue: string;
  country: string;
  regulation: string[];
  asset: Asset[];
  structure: string;
  architecture: string;
  measure: string;
  constraint: string;
}

const OrganizationCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Congo (Congo-Kinshasa)", 
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica", 
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", 
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
    "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", 
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", 
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
    "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", 
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", 
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", 
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", 
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", 
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", 
    "Yemen", "Zambia", "Zimbabwe"
  ];

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Energy",
    "Transportation",
    "Hospitality",
    "Telecommunications",
    "Other"
  ];

  const regulations = ["GDPR", "PDPA", "HIPAA", "PCI DSS", "SOX", "NIST CSF", "ISO 27001", "FISMA"];

  const [formData, setFormData] = React.useState<OrganizationFormData>({
    user_id: '',
    name: '',
    status: 1,
    description: '',
    industry: '',
    employees: 0,
    customers: 0,
    revenue: '0',
    country: '',
    regulation: [],
    asset: [],
    structure: '',
    architecture: '',
    measure: '',
    constraint: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newAsset, setNewAsset] = useState<Asset>({ name: '', value: 0, criticality: 3 });
  const [newRegulation, setNewRegulation] = useState<string>('');
  const [otherRegulation, setOtherRegulation] = useState<string>('');

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

    if (!formData.industry) newErrors.industry = 'Industry is required';

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1,000 characters';
    }

    if (!formData.country) newErrors.country = 'Country is required';
    if (formData.country.length > 100) {
      newErrors.country = 'Country must not exceed 100 characters';
    }

    const revenueStr = formData.revenue as string;
    if (revenueStr != '0') {
      if (!/^-?(0\.\d{1,2}|[1-9]\d*(\.\d{1,2})?)$/.test(revenueStr)) {
        newErrors.revenue = 'Invalid revenue format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      revenue: parseFloat(formData.revenue) || 0
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'user_error') {
          setErrors((prev) => ({ ...prev, user_id: 'User not found' }));
        } else {
          throw new Error(responseData.error || 'Failed to create organization');
        }
        return;
      }

      toast.success('Organization created successfully');
      navigate('/admin/organizations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    }
  };

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.criticality) {
      setErrors((prev) => ({ 
        ...prev, 
        asset: 'Asset name and criticality are required' 
      }));
      return;
    }

    const valueStr = String(newAsset.value);
    if(valueStr != "0") {
      if (!/^(0\.\d{1,2}|[1-9]\d*(\.\d{1,2})?)$/.test(valueStr)) {
        setErrors((prev) => ({ 
          ...prev, 
          asset: 'Invalid value format' 
        }));
        return;
      } else {
        if (newAsset.value < 1) {
          setErrors((prev) => ({ 
            ...prev, 
            asset: 'Value must be greater than 1' 
          }));
          return;
        }
      }
    }
    
    setFormData({
      ...formData,
      asset: [...formData.asset, {
        name: newAsset.name, 
        value: newAsset.value, 
        criticality: newAsset.criticality 
      }]
    });
    
    setNewAsset({ name: '', value: 0, criticality: 3 });
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

  const handleAddRegulation = () => {
    if (newRegulation === 'other' && !otherRegulation) {
      setErrors((prev) => ({ 
        ...prev, 
        regulation: 'Please specify the regulation' 
      }));
      return;
    }
    
    const regulationToAdd = newRegulation === 'other' ? otherRegulation : newRegulation;
    
    if (!regulationToAdd) {
      setErrors((prev) => ({ 
        ...prev, 
        regulation: 'Please select a regulation' 
      }));
      return;
    }
    
    if (formData.regulation.includes(regulationToAdd)) {
      setErrors((prev) => ({ 
        ...prev, 
        regulation: 'This regulation is already added' 
      }));
      return;
    }
    
    setFormData({
      ...formData,
      regulation: [...formData.regulation, regulationToAdd]
    });
    
    setNewRegulation('');
    setOtherRegulation('');
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.regulation;
      return updated;
    });
  };

  const handleRemoveRegulation = (index: number) => {
    const updatedRegulations = [...formData.regulation];
    updatedRegulations.splice(index, 1);
    setFormData({
      ...formData,
      regulation: updatedRegulations
    });
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Organization</h1>
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
            <label className="block mb-2">Industry</label>
            <select
              value={formData.industry}
              onChange={e => setFormData({ ...formData, industry: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select a industry</option>
              {industries.map((industry, index) => (
                <option key={index} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && <p className="text-red-500 text-sm mt-2">{errors.industry}</p>}
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
          </div>

          <div>
            <label className="block mb-2">Country</label>
            <select
              value={formData.country}
              onChange={e => setFormData({ ...formData, country: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select a country</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-2">{errors.country}</p>}
          </div>

          <div>
            <label className="block mb-2">Regulations</label>
            <div className="flex gap-2.5">
              <select
                value={newRegulation}
                onChange={e => setNewRegulation(e.target.value)}
                className="flex-grow border p-2 rounded"
              >
                <option value="">Select a regulation</option>
                {regulations.map((reg, index) => (
                  <option key={index} value={reg}>{reg}</option>
                ))}
                <option value="other">Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddRegulation}
                className="bg-blue-500 text-white px-5 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            
            {newRegulation === 'other' && (
              <input
                type="text"
                value={otherRegulation}
                onChange={e => setOtherRegulation(e.target.value)}
                placeholder="Specify regulation"
                className="w-full border p-2 rounded mt-2.5"
              />
            )}
            
            {errors.regulation && <p className="text-red-500 text-sm mt-2">{errors.regulation}</p>}

            {formData.regulation.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {formData.regulation.map((reg, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm">{reg}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRegulation(index)}
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
            <label className="block mb-2">Assets</label>
            
            {formData.asset.length > 0 && (
              <div className="mb-6 rounded-md border border-b-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Value</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Criticality</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.asset.map((asset, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2 text-sm">{asset.name}</td>
                          <td className="px-4 py-2 text-sm">${asset.value.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">
                            {asset.criticality === 1 ? (
                              <>Very Low</>
                            ) : asset.criticality === 2 ? (
                              <>Low</>
                            ) : asset.criticality === 3 ? (
                              <>Medium</>
                            ) : asset.criticality === 4 ? (
                              <>High</>
                            ) : asset.criticality === 5 ? (
                              <>Critical</>
                            ) : null}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveAsset(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div>
                  <label className="block text-sm mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={newAsset.name}
                    onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Asset Value</label>
                  <input
                    type="number"
                    value={newAsset.value}
                    onChange={e => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                    className="w-full border p-2 rounded"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Criticality</label>
                  <select
                    value={newAsset.criticality}
                    onChange={e => setNewAsset({ ...newAsset, criticality: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                    className="w-full border p-2 rounded"
                  >
                    <option value="1">Very Low</option>
                    <option value="2">Low</option>
                    <option value="3">Medium</option>
                    <option value="4">High</option>
                    <option value="5">Critical</option>
                  </select>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddAsset}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Add
              </button>

              {errors.asset && <p className="text-red-500 text-sm mt-4">{errors.asset}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-2">Employees</label>
            <input
                type="number"
                value={formData.employees}
                onChange={e => setFormData({ ...formData, employees: Number(e.target.value) })}
                className="w-full border p-2 rounded"
            />
            {errors.employees && <p className="text-red-500 text-sm mt-2">{errors.employees}</p>}
          </div>

          <div>
            <label className="block mb-2">Customers</label>
            <input
                type="number"
                value={formData.customers}
                onChange={e => setFormData({ ...formData, customers: Number(e.target.value) })}
                className="w-full border p-2 rounded"
            />
            {errors.customers && <p className="text-red-500 text-sm mt-2">{errors.customers}</p>}
          </div>

          <div>
            <label className="block mb-2">Revenue</label>
            <input
                type="number"
                value={formData.revenue}
                onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                className="w-full border p-2 rounded"
                step="0.01"
            />
            {errors.revenue && <p className="text-red-500 text-sm mt-2">{errors.revenue}</p>}
          </div>

          <div>
            <label className="block mb-2">Structure</label>
            <textarea
              value={formData.structure}
              onChange={e => setFormData({ ...formData, structure: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.structure && <p className="text-red-500 text-sm mt-2">{errors.structure}</p>}
          </div>

          <div>
            <label className="block mb-2">Architecture</label>
            <textarea
              value={formData.architecture}
              onChange={e => setFormData({ ...formData, architecture: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.architecture && <p className="text-red-500 text-sm mt-2">{errors.architecture}</p>}
          </div>

          <div>
            <label className="block mb-2">Measure</label>
            <textarea
              value={formData.measure}
              onChange={e => setFormData({ ...formData, measure: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.measure && <p className="text-red-500 text-sm mt-2">{errors.measure}</p>}
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
              onClick={() => navigate('/admin/organizations')}
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

export default OrganizationCreate;