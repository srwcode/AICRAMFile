import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';

interface MatrixFormData {
  name: string;
  status: 1 | 2;
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

const MatrixEdit = () => {
  const { matrix_id } = useParams<{ matrix_id: string }>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [formData, setFormData] = React.useState<MatrixFormData>({
    name: '',
    status: 1,
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

    if (!formData.status || (formData.status !== 1 && formData.status !== 2)) {
      newErrors.status = 'Status must be Active or Inactive';
    }

    if (!formData.type || (formData.type !== 1 && formData.type !== 2 && formData.type !== 3)) {
      newErrors.type = 'Type must be New or Used';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
      const fetchMatrix = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/matrices/${matrix_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });
          if (!response.ok) throw new Error('Failed to fetch matrix');
          const data = await response.json();
          
          setFormData({
            name: data.name,
            status: data.status,
            type: data.type,
            description: data.description,
            impact_1: data.impact_1,
            impact_2: data.impact_2,
            impact_3: data.impact_3,
            impact_4: data.impact_4,
            impact_5: data.impact_5,
            likelihood_1: data.likelihood_1,
            likelihood_2: data.likelihood_2,
            likelihood_3: data.likelihood_3,
            likelihood_4: data.likelihood_4,
            likelihood_5: data.likelihood_5
          });

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load matrix');
        } finally {
          setLoading(false);
        }
      };
      fetchMatrix();
    }, [matrix_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    var dataImpact1;
    var dataImpact5;
    var dataLikelihood1;
    var dataLikelihood5;

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
      impact_1: dataImpact1,
      impact_5: dataImpact5,
      likelihood_1: dataLikelihood1,
      likelihood_5: dataLikelihood5
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/matrices/${matrix_id}`, {
        method: "PUT",
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
          throw new Error(responseData.error || 'Failed to update matrix');
        }
        return;
      }

      toast.success('Matrix updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update matrix');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Matrix</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">

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
            <label className="block mb-2">Type</label>
            <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: Number(e.target.value) as 1 | 2 | 3 })}
                className="w-full border p-2 rounded"
            >
                <option value="1">3x3</option>
                <option value="2">4x4</option>
                <option value="3">5x5</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-2">{errors.type}</p>}
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
          
          {formData.type === 3 && (
          <div>
            <label className="block mb-2">Impact - Very Low</label>
            <textarea
              value={formData.impact_1}
              onChange={e => setFormData({ ...formData, impact_1: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.impact_1 && <p className="text-red-500 text-sm mt-2">{errors.impact_1}</p>}
          </div>
          )}

          <div>
            <label className="block mb-2">Impact - Low</label>
            <textarea
              value={formData.impact_2}
              onChange={e => setFormData({ ...formData, impact_2: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.impact_2 && <p className="text-red-500 text-sm mt-2">{errors.impact_2}</p>}
          </div>

          <div>
            <label className="block mb-2">Impact - Medium</label>
            <textarea
              value={formData.impact_3}
              onChange={e => setFormData({ ...formData, impact_3: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.impact_3 && <p className="text-red-500 text-sm mt-2">{errors.impact_3}</p>}
          </div>

          <div>
            <label className="block mb-2">Impact - High</label>
            <textarea
              value={formData.impact_4}
              onChange={e => setFormData({ ...formData, impact_4: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.impact_4 && <p className="text-red-500 text-sm mt-2">{errors.impact_4}</p>}
          </div>

          {(formData.type === 2 || formData.type === 3) && (
          <div>
            <label className="block mb-2">Impact - Extreme</label>
            <textarea
              value={formData.impact_5}
              onChange={e => setFormData({ ...formData, impact_5: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.impact_5 && <p className="text-red-500 text-sm mt-2">{errors.impact_5}</p>}
          </div>
          )}

          {formData.type === 3 && (
          <div>
            <label className="block mb-2">Likelihood - Very Low</label>
            <textarea
              value={formData.likelihood_1}
              onChange={e => setFormData({ ...formData, likelihood_1: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.likelihood_1 && <p className="text-red-500 text-sm mt-2">{errors.likelihood_1}</p>}
          </div>
          )}

          <div>
            <label className="block mb-2">Likelihood - Low</label>
            <textarea
              value={formData.likelihood_2}
              onChange={e => setFormData({ ...formData, likelihood_2: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.likelihood_2 && <p className="text-red-500 text-sm mt-2">{errors.likelihood_2}</p>}
          </div>

          <div>
            <label className="block mb-2">Likelihood - Medium</label>
            <textarea
              value={formData.likelihood_3}
              onChange={e => setFormData({ ...formData, likelihood_3: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.likelihood_3 && <p className="text-red-500 text-sm mt-2">{errors.likelihood_3}</p>}
          </div>

          <div>
            <label className="block mb-2">Likelihood - High</label>
            <textarea
              value={formData.likelihood_4}
              onChange={e => setFormData({ ...formData, likelihood_4: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.likelihood_4 && <p className="text-red-500 text-sm mt-2">{errors.likelihood_4}</p>}
          </div>

          {(formData.type === 2 || formData.type === 3) && (
          <div>
            <label className="block mb-2">Likelihood - Extreme</label>
            <textarea
              value={formData.likelihood_5}
              onChange={e => setFormData({ ...formData, likelihood_5: e.target.value })}
              className="w-full border p-2 rounded h-32 resize-none"
            />
            {errors.likelihood_5 && <p className="text-red-500 text-sm mt-2">{errors.likelihood_5}</p>}
          </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/matrices')}
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

export default MatrixEdit;