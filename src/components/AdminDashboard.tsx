import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Mail, 
  Calendar, 
  Package, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { getAllUsers, getUserStatistics, User } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPlan, setFilterPlan] = useState<string | null>(null);
  
  const usersPerPage = 10;

  // Load users and statistics
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load users
        const { data: userData, error: userError } = await getAllUsers();
        if (userError) {
          throw new Error(`Failed to load users: ${userError.message}`);
        }
        setUsers(userData || []);
        
        // Load statistics
        const { data: statsData, error: statsError } = await getUserStatistics();
        if (statsError) {
          console.error('Failed to load statistics:', statsError);
          // Don't throw here, we can still show users without stats
        }
        setStatistics(statsData || {
          total_users: userData?.length || 0,
          signups_last_24h: 0,
          signups_last_7d: 0,
          signups_last_30d: 0,
          verified_users: 0,
          complete_plan_users: 0
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error loading admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: userError } = await getAllUsers();
      if (userError) {
        throw new Error(`Failed to refresh users: ${userError.message}`);
      }
      setUsers(data || []);
      
      const { data: statsData, error: statsError } = await getUserStatistics();
      if (statsError) {
        console.error('Failed to refresh statistics:', statsError);
      } else {
        setStatistics(statsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export users as CSV
  const exportCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Plan Type', 'Signup Date', 'Verified', 'Created At'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.plan_type,
      new Date(user.signup_date).toLocaleDateString(),
      user.email_verified ? 'Yes' : 'No',
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan ? user.plan_type === filterPlan : true;
    
    return matchesSearch && matchesPlan;
  });
  
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  // Handle sort
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Manage users and view signup statistics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Total Users</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900">{statistics.total_users || users.length}</div>
            <div className="mt-2 text-sm text-slate-500">
              <span className="text-green-600 font-medium">+{statistics.signups_last_24h || 0}</span> in the last 24 hours
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Signups</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900">{statistics.signups_last_7d || 0}</div>
            <div className="mt-2 text-sm text-slate-500">
              Last 7 days ({statistics.signups_last_30d || 0} in last 30 days)
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Complete Plan</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900">{statistics.complete_plan_users || 0}</div>
            <div className="mt-2 text-sm text-slate-500">
              {statistics.total_users ? Math.round((statistics.complete_plan_users / statistics.total_users) * 100) : 0}% of total users
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Filter Plan</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <button
                  onClick={() => setFilterPlan(null)}
                  className={`flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                    filterPlan === null ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                  }`}
                >
                  <span>All Plans</span>
                  {filterPlan === null && (
                    <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />
                  )}
                </button>
                <button
                  onClick={() => setFilterPlan('complete')}
                  className={`flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                    filterPlan === 'complete' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                  }`}
                >
                  <span>Complete</span>
                  {filterPlan === 'complete' && (
                    <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />
                  )}
                </button>
                <button
                  onClick={() => setFilterPlan('free')}
                  className={`flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                    filterPlan === 'free' ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                  }`}
                >
                  <span>Free</span>
                  {filterPlan === 'free' && (
                    <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading user data...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterPlan
                ? 'No users match your search criteria'
                : 'No users have signed up yet'}
            </p>
            {(searchTerm || filterPlan) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterPlan(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === 'name' && (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        {sortField === 'email' && (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('plan_type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Plan</span>
                        {sortField === 'plan_type' && (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Signup Date</span>
                        {sortField === 'created_at' && (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('email_verified')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Verified</span>
                        {sortField === 'email_verified' && (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan_type === 'complete' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {user.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;