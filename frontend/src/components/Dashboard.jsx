import React, { useEffect, useState } from 'react';
import { LogOut, Users, Upload, FileText, Trash2, Edit, Plus, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { logout } from '../utils/auth';
import api from '../services/api';
import AgentForm from './AgentForm';
import FileUpload from './FileUpload';
import { DistributionList } from './DistributionView';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agents');
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalDistributions: 0,
    totalRecords: 0
  });

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      setAgents(response.data.data);
    } catch (error) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [agentsResponse, distributionsResponse] = await Promise.all([
        api.get('/agents'),
        api.get('/upload/distributions')
      ]);
      
      const agents = agentsResponse.data.data;
      const distributions = distributionsResponse.data.data;
      
      setStats({
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.isActive).length,
        totalDistributions: distributions.length,
        totalRecords: distributions.reduce((sum, d) => sum + d.totalRecords, 0)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDeleteAgent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete agent "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/agents/${id}`);
      toast.success(`Agent "${name}" deleted successfully`);
      fetchAgents();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Users, count: stats.totalAgents },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'distributions', label: 'Distributions', icon: FileText, count: stats.totalDistributions }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Agent Management Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage agents and distribute tasks efficiently</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Distributions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistributions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Status Alert */}
        {stats.activeAgents < 5 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Agent Requirement Notice
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You need exactly 5 active agents to distribute records. Currently you have {stats.activeAgents} active agents.
                  {stats.activeAgents < 5 && ' Please create more agents to enable file distribution.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <AgentForm onCreated={() => { fetchAgents(); fetchStats(); }} />
              
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Agents Management</h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {agents.length} agent{agents.length !== 1 ? 's' : ''} • {stats.activeAgents} active
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                    <p className="text-gray-500 mb-4">Create your first agent to get started</p>
                    <button
                      onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-primary flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Agent
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agent Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {agents.map((agent) => (
                          <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                                <div className="text-sm text-gray-500">{agent.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {agent.countryCode} {agent.mobile}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                agent.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteAgent(agent._id, agent.name)}
                                className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <FileUpload onUploadSuccess={() => fetchStats()} />
          )}

          {activeTab === 'distributions' && (
            <DistributionList />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;