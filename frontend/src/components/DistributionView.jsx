import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, FileText, Users, Eye, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const DistributionList = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      const response = await api.get('/upload/distributions');
      setDistributions(response.data.data);
    } catch (error) {
      toast.error('Failed to load distributions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Distribution History</h3>
      </div>

      {distributions.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No distributions found</p>
          <p className="text-sm text-gray-400">Upload a file to see distributions here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {distributions.map((distribution) => (
            <div key={distribution._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {distribution.fileName}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(distribution.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {distribution.totalRecords} records
                    </div>
                    {distribution.skippedCount > 0 && (
                      <div className="flex items-center text-yellow-600">
                        <span className="text-xs">⚠️ {distribution.skippedCount} skipped</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  to={`/distributions/${distribution._id}`}
                  className="btn-secondary flex items-center text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DistributionDetail = () => {
  const { id } = useParams();
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      const response = await api.get(`/upload/distributions/${id}`);
      setDistribution(response.data.data);
    } catch (error) {
      toast.error('Failed to load distribution details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!distribution) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Distribution not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">{distribution.fileName}</h2>
          </div>
          <Link to="/dashboard" className="btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{distribution.totalRecords}</div>
            <div className="text-sm text-blue-800">Total Records</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{distribution.distributions.length}</div>
            <div className="text-sm text-green-800">Agents Used</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{distribution.skippedCount || 0}</div>
            <div className="text-sm text-yellow-800">Skipped Records</div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Uploaded:</strong> {new Date(distribution.createdAt).toLocaleString()}</p>
          {distribution.uploadedBy?.email && (
            <p><strong>Uploaded by:</strong> {distribution.uploadedBy.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {distribution.distributions.map((agentDistribution, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                {agentDistribution.agentName}
              </h3>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {agentDistribution.recordCount} records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agentDistribution.records.map((record, recordIndex) => (
                    <tr key={recordIndex} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {distribution.validationErrors && distribution.validationErrors.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Skipped Records</h3>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              {distribution.validationErrors.map((error, index) => (
                <div key={index} className="py-1 border-b border-yellow-200 last:border-b-0">
                  <strong>Row {error.row}:</strong> {error.error}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
