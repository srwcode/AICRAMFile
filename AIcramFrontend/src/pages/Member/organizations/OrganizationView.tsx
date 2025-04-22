import React from 'react';
import { useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import config from '../../../config';

interface Asset {
  name: string;
  value: number;
  criticality: 1 | 2 | 3 | 4 | 5;
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
  created_at: string;
  updated_at: string;
}

const OrganizationView = () => {
  const { organization_id } = useParams<{ organization_id: string }>();
  const [organization, setOrganization] = React.useState<Organization | null>(null);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, "dd MMMM yyyy | HH:mm", { locale: enUS })} (${formatDistanceToNow(date, { addSuffix: true, locale: enUS })})`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg">
      <div className="animate-pulse flex space-x-2">
        <div className="h-3 w-3 bg-white rounded-full"></div>
        <div className="h-3 w-3 bg-white rounded-full"></div>
        <div className="h-3 w-3 bg-white rounded-full"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
      Error: {error}
    </div>
  );
  
  if (!organization) return (
    <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 p-4 rounded-lg">
      Organization not found
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-6 pt-6 pb-8 lg:px-8 lg:pb-10 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-8">Organization: {organization.name}</h1>

      <div className="space-y-8">
        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Basic Information</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Industry</p>
                <p className="text-white">{organization.industry}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Country</p>
                <p className="text-white">{organization.country}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Description</p>
              {organization.description ? (
                <p className="text-gray-300 whitespace-pre-wrap">{organization.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Employees</p>
                <p className="text-white">{organization.employees.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Customers</p>
                <p className="text-white">{organization.customers.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Revenue</p>
              <p className="text-white">${organization.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Created</p>
                <p className="text-gray-300">{formatDate(organization.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Updated</p>
                <p className="text-gray-300">{formatDate(organization.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Regulations</h2>
          {organization.regulation.length > 0 ? (
            <div className="p-5 bg-gray-900 rounded-b-lg space-y-2">
              {organization.regulation.map((reg, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                  <p className="text-gray-300">{reg}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-15 text-gray-400 bg-gray-900 rounded-b-lg">
              <p>No regulations found</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Assets</h2>
          {organization.asset.length > 0 ? (
            <div className="overflow-x-auto rounded-b-lg">
              <table className="min-w-full border-collapse">
                <thead className="border-b border-gray-700">
                  <tr className="bg-gray-900 text-left">
                    <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Name</th>
                    <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Value</th>
                    <th className="w-1/3 px-6 py-5 text-left font-medium text-gray-300">Criticality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {organization.asset.map((asset, index) => (
                    <tr key={index} className="bg-gray-900 hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-5 text-white">{asset.name}</td>
                      <td className="px-6 py-5 text-white">
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-2 rounded-full text-sm ${
                          asset.criticality === 1 ? 'bg-blue-900/50 text-blue-300' :
                          asset.criticality === 2 ? 'bg-green-900/50 text-green-300' :
                          asset.criticality === 3 ? 'bg-yellow-900/50 text-yellow-300' :
                          asset.criticality === 4 ? 'bg-orange-900/50 text-orange-300' :
                          asset.criticality === 5 ? 'bg-red-900/50 text-red-300' :
                          'bg-gray-900 text-white'
                        }`}>
                          {asset.criticality === 1 ? 'Very Low' :
                            asset.criticality === 2 ? 'Low' :
                            asset.criticality === 3 ? 'Medium' :
                            asset.criticality === 4 ? 'High' :
                            asset.criticality === 5 ? 'Critical' :
                            'None'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-15 text-gray-400 bg-gray-900 rounded-b-lg">
              <p>No assets found</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Organizational Structure</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {organization.structure ? (
              <p className="text-gray-300 whitespace-pre-wrap">{organization.structure}</p>
            ) : (
              <p className="text-gray-500">No structure</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Technical Architecture</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {organization.architecture ? (
              <p className="text-gray-300 whitespace-pre-wrap">{organization.architecture}</p>
            ) : (
              <p className="text-gray-500">No architecture</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Security Measures</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {organization.measure ? (
              <p className="text-gray-300 whitespace-pre-wrap">{organization.measure}</p>
            ) : (
              <p className="text-gray-500">No measures</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white p-5 bg-gray-900 rounded-t-lg border-b border-gray-700">Constraints</h2>
          <div className="p-5 bg-gray-900 rounded-b-lg min-h-30">
            {organization.constraint ? (
              <p className="text-gray-300 whitespace-pre-wrap">{organization.constraint}</p>
            ) : (
              <p className="text-gray-500">No constraint</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizationView;