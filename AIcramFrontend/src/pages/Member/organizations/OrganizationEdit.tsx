import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { ChevronDown } from "lucide-react";

interface Asset {
  name: string;
  value: GLfloat;
  criticality: 1 | 2 | 3 | 4 | 5;
}

interface OrganizationFormData {
  name: string;
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

interface Assessment {
  assessment_id: string;
  organization_id: string;
}

const OrganizationEdit = () => {
  const { organization_id } = useParams<{ organization_id: string }>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [newAsset, setNewAsset] = useState<Asset>({ name: '', value: 0, criticality: 3 });
  const [newRegulation, setNewRegulation] = useState<string>('');
  const [otherRegulation, setOtherRegulation] = useState<string>('');
  
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
    name: '',
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) newErrors.name = 'Name is required';
    else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
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

    const employeesStr = String(formData.employees);
    if (!/^\d+$/.test(employeesStr)) {
      newErrors.employees = 'Invalid number of employees format';
    }

    const customersStr = String(formData.customers);
    if (!/^\d+$/.test(customersStr)) {
      newErrors.customers = 'Invalid number of customers format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAssessments = async (organizationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/assessments?user_id=current`, {
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        }
      });
      
      if (!response.ok) return;

      const data = await response.json();
      if (data.assessment_items && Array.isArray(data.assessment_items)) {
        let count = 0;
        data.assessment_items.forEach((assessment: Assessment) => {
          if (assessment.organization_id === organizationId) {
            count++;
          }
        });
        
        if (count > 0) {
          navigate('/member/organizations')
        }
      }
    } catch (err) {
      console.error('Error checking organization:', err);
    }
  };

  React.useEffect(() => {
      const fetchOrganization = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/organizations/${organization_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });
          if (!response.ok) throw new Error('Failed to fetch organization');
          const data = await response.json();

          setFormData({
            name: data.name,
            description: data.description,
            industry: data.industry,
            employees: data.employees,
            customers: data.customers,
            revenue: data.revenue,
            country: data.country,
            regulation: data.regulation || [],
            asset: data.asset || [],
            structure: data.structure,
            architecture: data.architecture,
            measure: data.measure,
            constraint: data.constraint
          });

          await checkAssessments(organization_id || '');

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load organization');
        } finally {
          setLoading(false);
        }
      };

      fetchOrganization();
    }, [organization_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      status: 1,
      revenue: parseFloat(formData.revenue) || 0
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/organizations/${organization_id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update organization');
        return;
      }

      toast.success('Organization updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
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

  const getCriticalityColor = (level: number) => {
    switch(level) {
      case 1: return "bg-blue-900/50 text-blue-300";
      case 2: return "bg-green-900/50 text-green-300";
      case 3: return "bg-yellow-900/50 text-yellow-300";
      case 4: return "bg-orange-900/50 text-orange-300";
      case 5: return "bg-red-900/50 text-red-300";
      default: return "bg-gray-900 text-white";
    }
  };

  const inputClass = "w-full text-white bg-gray-900 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-gray-400 transition duration-150";

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
      <div className="border-b border-gray-700 px-6 py-4 lg:px-8 lg:py-6">
        <h1 className="text-2xl font-bold text-white">
          Edit Organization
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
                  placeholder="Enter organization name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Industry <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select an industry</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                {errors.industry && <p className="text-red-400 text-sm mt-2">{errors.industry}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the organization and its business"
                />
                {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Country <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country}>{country}</option>
                    ))}
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                {errors.country && <p className="text-red-400 text-sm mt-2">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Annual Revenue (USD)</label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                  className={inputClass}
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.revenue && <p className="text-red-400 text-sm mt-2">{errors.revenue}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Number of Employees</label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={e => setFormData({ ...formData, employees: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="0"
                />
                {errors.employees && <p className="text-red-400 text-sm mt-2">{errors.employees}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Number of Customers</label>
                <input
                  type="number"
                  value={formData.customers}
                  onChange={e => setFormData({ ...formData, customers: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="0"
                />
                {errors.customers && <p className="text-red-400 text-sm mt-2">{errors.customers}</p>}
              </div>
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Regulatory Compliance
            </div>
            <div className="pb-10 border-b border-gray-700">
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="relative flex-grow">
                  <select
                    value={newRegulation}
                    onChange={e => setNewRegulation(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select a regulation</option>
                    {regulations.map((reg, index) => (
                      <option key={index} value={reg}>{reg}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                <button
                  type="button"
                  onClick={handleAddRegulation}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md border border-gray-600 transition-colors"
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
                  className={`${inputClass} mt-4`}
                />
              )}
              
              {errors.regulation && <p className="text-red-400 text-sm mt-2">{errors.regulation}</p>}

              {formData.regulation.length > 0 && (
                <div className="mt-5">
                  <div className="flex flex-wrap gap-x-2.5 gap-y-4">
                    {formData.regulation.map((reg, index) => (
                      <div key={index} className="flex items-center bg-gray-900 border border-gray-600 px-4 py-2 rounded-full">
                        <span className="ml-1.5 text-sm text-white">{reg}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveRegulation(index)}
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
              Assets
            </div>
            <div className="pb-10 border-b border-gray-700">

            <div className="p-6 border rounded-md border-gray-700 bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Asset Name</label>
                    <input
                      type="text"
                      value={newAsset.name}
                      onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                      className={`${inputClass} bg-gray-800 border border-gray-700`}
                      placeholder="Enter asset name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Asset Value (USD)</label>
                    <input
                      type="number"
                      value={newAsset.value}
                      onChange={e => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                      className={`${inputClass} bg-gray-800 border border-gray-700`}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Criticality</label>
                    <div className="relative">
                      <select
                        value={newAsset.criticality}
                        onChange={e => setNewAsset({ ...newAsset, criticality: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                        className={inputClass + " bg-gray-800 border border-gray-700 appearance-none pr-10"}
                      >
                        <option value="1">Very Low</option>
                        <option value="2">Low</option>
                        <option value="3">Medium</option>
                        <option value="4">High</option>
                        <option value="5">Critical</option>
                      </select>

                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md border border-gray-600 transition-colors"
                >
                  Add Asset
                </button>

                {errors.asset && <p className="text-red-400 text-sm mt-4">{errors.asset}</p>}
              </div>

              {formData.asset.length > 0 && (
                <div className="mt-8 rounded-md border border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="border-b border-gray-700">
                        <tr className="bg-gray-900 text-left">
                          <th className="w-1/4 px-6 py-5 text-left font-medium text-gray-300">Name</th>
                          <th className="w-1/4 px-6 py-5 text-left font-medium text-gray-300">Value</th>
                          <th className="w-1/4 px-6 py-5 text-left font-medium text-gray-300">Criticality</th>
                          <th className="w-1/4 px-6 py-5 text-left font-medium text-gray-300"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {formData.asset.map((asset, index) => (
                          <tr key={index} className="bg-gray-900 hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-5 text-white">{asset.name}</td>
                            <td className="px-6 py-5 text-white">
                              ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-2 rounded-full text-sm ${getCriticalityColor(asset.criticality)}`}>
                                {asset.criticality === 1 ? "Very Low" : 
                                 asset.criticality === 2 ? "Low" : 
                                 asset.criticality === 3 ? "Medium" : 
                                 asset.criticality === 4 ? "High" : 
                                 asset.criticality === 5 ? "Critical" : 
                                 "None"}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <button
                                type="button"
                                onClick={() => handleRemoveAsset(index)}
                                className="text-red-400 hover:text-red-500 transition-colors"
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
            </div>
          </div>

          <div>
            <div className="text-white font-medium text-lg mb-4">
              Technical Information
            </div>
            <div className="pb-10 border-b border-gray-700 space-y-5">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Organizational Structure</label>
                <textarea
                  value={formData.structure}
                  onChange={e => setFormData({ ...formData, structure: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the organizational structure"
                />
                {errors.structure && <p className="text-red-400 text-sm mt-2">{errors.structure}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Technical Architecture</label>
                <textarea
                  value={formData.architecture}
                  onChange={e => setFormData({ ...formData, architecture: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the technical architecture"
                />
                {errors.architecture && <p className="text-red-400 text-sm mt-2">{errors.architecture}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Security Measures</label>
                <textarea
                  value={formData.measure}
                  onChange={e => setFormData({ ...formData, measure: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe current security measures"
                />
                {errors.measure && <p className="text-red-400 text-sm mt-2">{errors.measure}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Constraints</label>
                <textarea
                  value={formData.constraint}
                  onChange={e => setFormData({ ...formData, constraint: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe any business or technical constraints"
                />
                {errors.constraint && <p className="text-red-400 text-sm mt-2">{errors.constraint}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-white hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-all duration-200 font-medium"
            >
              Update Organization
            </button>
            <button
              type="button"
              onClick={() => navigate('/member/organizations')}
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

export default OrganizationEdit;