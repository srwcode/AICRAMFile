import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';


interface Asset {
  name: string;
  value: GLfloat;
  criticality: 1 | 2 | 3 | 4 | 5;
}

interface Organization {
  organization_id: string;
  user_id: string;
  name: string;
  status: 1 | 2;
  description: string;
  industry: string;
  employees: number;
  customers: number;
  revenue: GLfloat;
  country: string;
  regulation: string[];
  asset: Asset[];
  structure: string;
  architecture: string;
  measure: string;
  constraint: string;
  created_at: string;
  updated_at: string;
}

const OrganizationView = () => {
  const { organization_id } = useParams<{ organization_id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
        setOrganization(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organization_id]);

  useEffect(() => {
    const fetchUsername = async () => {
      const userId = organization?.user_id;

      if (userId) {
        setLoadingUsername(true);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.API_URL}/users/username?user_id=${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': token || ''
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch username');
          }

          const data = await response.json();
          setUsername(data.username);
        } catch (error) {
          console.error('Error fetching username:', error);
          setUsername('Unknown User');
        } finally {
          setLoadingUsername(false);
        }
      }
    };

    if (organization && organization.user_id) {
      fetchUsername();
    }
  }, [organization]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!organization) return <div>Organization not found</div>;

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-8 py-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Organization Details</h1>

        <div className="space-y-5">
          <div>
            <p className="font-medium text-gray-600 mb-1">ID</p>
            <p>{organization.organization_id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Name</p>
            <p>{organization.name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">User</p>
            <p>
              {loadingUsername ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <a className="text-blue-500 hover:underline" href={`/admin/users/${organization.user_id}`}>
                  {username || "Unknown User"}
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Status</p>
            <p>
              {organization.status === 1 ? (
                <span className="text-green-500">Active</span>
              ) : organization.status === 2 ? (
                <span className="text-red-500">Inactive</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Industry</p>
            <p>{organization.industry}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Description</p>
            <p className="whitespace-pre-wrap">{organization.description}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Country</p>
            <p>{organization.country}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Regulations</p>
            <p>
              {organization.regulation.length > 0 && (
              <>
                {organization.regulation.map((reg) => (
                  <p>• {reg}</p>
                ))}
              </>
              )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Assets</p>
            <p>
            {organization.asset.length > 0 && (
              <div className="mt-2 rounded-md border border-b-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Value</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Criticality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organization.asset.map((asset, index) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Employees</p>
            <p>{organization.employees}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Customers</p>
            <p>{organization.customers}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Revenue</p>
            <p>${organization.revenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Structure</p>
            <p className="whitespace-pre-wrap">{organization.structure}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Architecture</p>
            <p className="whitespace-pre-wrap">{organization.architecture}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Measure</p>
            <p className="whitespace-pre-wrap">{organization.measure}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Constraint</p>
            <p className="whitespace-pre-wrap">{organization.constraint}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Created</p>
            <p>{formatDate(organization.created_at)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-1">Updated</p>
            <p>{formatDate(organization.updated_at)}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/admin/organizations/${organization_id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/admin/organizations')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

      </div>
    </>
  );
};

export default OrganizationView;