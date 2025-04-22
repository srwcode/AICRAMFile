import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface ResultFormData {
  status: 1 | 2 | 3;
  assessment_id: string;
  content: string;
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

interface Content {
  success: 1 | 2;
  vulnerability: Vulnerability[];
  summary: string;
  message: string;
}

const ResultEdit = () => {
  const { result_id } = useParams<{ result_id: string }>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [formData, setFormData] = React.useState<ResultFormData>({
    status: 1,
    assessment_id: '',
    content: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.status || (formData.status !== 1 && formData.status !== 2 && formData.status !== 3)) {
      newErrors.status = 'Invalid status format';
    }

    if (!formData.assessment_id) newErrors.assessment_id = 'Assessment is required';

    try {
      const parsedContent: Content = JSON.parse(formData.content);
  
      if (parsedContent.success === undefined || parsedContent.success === null) {
        newErrors.content = 'Success is required';
      } else if (![1, 2].includes(parsedContent.success)) {
        newErrors.content = 'Success must be 1 or 2';
      }
  
      if (parsedContent.summary === undefined || parsedContent.summary === null) {
        newErrors.content = 'Summary is required';
      } else if (typeof parsedContent.summary !== 'string') {
        newErrors.content = 'Summary must be a string';
      }
  
      if (parsedContent.message === undefined || parsedContent.message === null) {
        newErrors.content = 'Message is required';
      } else if (typeof parsedContent.message !== 'string') {
        newErrors.content = 'Message must be a string';
      }
  
      if (!Array.isArray(parsedContent.vulnerability)) {
        newErrors.content = 'Vulnerabilities must be an array';
      } else {
        parsedContent.vulnerability.forEach((vul, index) => {

          if (!vul.name || typeof vul.name !== 'string') {
            newErrors.content = `Vulnerability at index ${index}: name is required and must be a string`;
            return;
          }
          
          if (!vul.description || typeof vul.description !== 'string') {
            newErrors.content = `Vulnerability at index ${index}: description is required and must be a string`;
            return;
          }
  
          if (!Array.isArray(vul.cve)) {
            newErrors.content = `Vulnerability at index ${index}: CVE must be an array`;
            return;
          }
          
          if (!Array.isArray(vul.mitre)) {
            newErrors.content = `Vulnerability at index ${index}: MITRE must be an array`;
            return;
          }
  
          if (vul.impact === undefined || vul.impact === null || 
              ![0, 1, 2, 3, 4, 5].includes(vul.impact)) {
            newErrors.content = `Vulnerability at index ${index}: impact must be between 0 and 5`;
            return;
          }
          
          if (vul.likelihood === undefined || vul.likelihood === null || 
              ![0, 1, 2, 3, 4, 5].includes(vul.likelihood)) {
            newErrors.content = `Vulnerability at index ${index}: likelihood must be between 0 and 5`;
            return;
          }
          
          if (vul.new_impact === undefined || vul.new_impact === null || 
              ![0, 1, 2, 3, 4, 5].includes(vul.new_impact)) {
            newErrors.content = `Vulnerability at index ${index}: new_impact must be between 0 and 5`;
            return;
          }
          
          if (vul.new_likelihood === undefined || vul.new_likelihood === null || 
              ![0, 1, 2, 3, 4, 5].includes(vul.new_likelihood)) {
            newErrors.content = `Vulnerability at index ${index}: new_likelihood must be between 0 and 5`;
            return;
          }
  
          if (!Array.isArray(vul.control)) {
            newErrors.content = `Vulnerability at index ${index}: controls must be an array`;
            return;
          }
  
          vul.control.forEach((ctrl, ctrlIndex) => {
            if (!ctrl.name || typeof ctrl.name !== 'string') {
              newErrors.content = `Control at index ${ctrlIndex} for vulnerability ${index}: name is required and must be a string`;
              return;
            }
            
            if (!ctrl.description || typeof ctrl.description !== 'string') {
              newErrors.content = `Control at index ${ctrlIndex} for vulnerability ${index}: description is required and must be a string`;
              return;
            }
  
            if (ctrl.nist !== undefined && ctrl.nist !== null && typeof ctrl.nist !== 'string') {
              newErrors.content = `Control at index ${ctrlIndex} for vulnerability ${index}: NIST must be a string`;
              return;
            }
  
            if (ctrl.iso !== undefined && ctrl.iso !== null && typeof ctrl.iso !== 'string') {
              newErrors.content = `Control at index ${ctrlIndex} for vulnerability ${index}: ISO must be a string`;
              return;
            }
          });
        });
      }
    } catch (error) {
      newErrors.content = 'Content must be a valid JSON';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    const fetchResult = async () => {
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
        
        setFormData({
          status: data.status,
          assessment_id: data.assessment_id,
          content: JSON.stringify(data.content, null, 2)
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [result_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      content: JSON.parse(formData.content)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/results/${result_id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'token': token || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'user_error' ||
            responseData.error === 'assessment_error'
        ) {
          if (responseData.error === 'user_error') {
            setErrors((prev) => ({ ...prev, user_id: 'User not found' }));
          }

          if (responseData.error === 'assessment_error') {
            setErrors((prev) => ({ ...prev, assessment_id: 'Assessment not found' }));
          }
        } else {
          throw new Error(responseData.error || 'Failed to create transaction');
        }
        return;
      }

      toast.success('Result updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update result');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Result</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2">Status</label>
            <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) as 1 | 2 })}
                className="w-full border p-2 rounded"
            >
                <option value="1">Completed</option>
                <option value="2">Failed</option>
                <option value="3">Removed</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-2">{errors.status}</p>}
          </div>

          <div>
            <label className="block mb-2">Assessment</label>
            <input
                type="text"
                value={formData.assessment_id}
                onChange={e => setFormData({ ...formData, assessment_id: e.target.value })}
                className="w-full border p-2 rounded"
            />
            {errors.assessment_id && <p className="text-red-500 text-sm mt-2">{errors.assessment_id}</p>}
          </div>

          <div>
            <label className="block mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full border p-2 rounded h-100"
            />
            {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
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
              onClick={() => navigate('/admin/results')}
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

export default ResultEdit;