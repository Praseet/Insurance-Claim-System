import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsAPI } from '../utils/api';
import { format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await claimsAPI.getAll();
      const claimsData = response.data.claims;
      setClaims(claimsData);

      // Calculate stats
      const newStats = {
        total: claimsData.length,
        submitted: claimsData.filter(c => c.status === 'submitted').length,
        under_review: claimsData.filter(c => c.status === 'under_review').length,
        approved: claimsData.filter(c => c.status === 'approved').length,
        rejected: claimsData.filter(c => c.status === 'rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { class: 'badge-submitted', icon: Clock },
      under_review: { class: 'badge-under-review', icon: AlertCircle },
      approved: { class: 'badge-approved', icon: CheckCircle },
      rejected: { class: 'badge-rejected', icon: XCircle }
    };

    const badge = badges[status] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`badge ${badge.class} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
        </div>
        {user.role === 'user' && (
          <Link to="/submit-claim" className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Submit New Claim</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Claims</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-blue-600">Submitted</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.submitted}</div>
        </div>
        <div className="card">
          <div className="text-sm text-yellow-600">Under Review</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">{stats.under_review}</div>
        </div>
        <div className="card">
          <div className="text-sm text-green-600">Approved</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</div>
        </div>
        <div className="card">
          <div className="text-sm text-red-600">Rejected</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</div>
        </div>
      </div>

      {/* Claims List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Claims</h2>
          <FileText className="h-6 w-6 text-gray-400" />
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
            <p className="text-gray-600 mb-4">Get started by submitting your first claim</p>
            {user.role === 'user' && (
              <Link to="/submit-claim" className="btn btn-primary">
                Submit Claim
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.claimNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {claim.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(claim.amountClaimed).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(claim.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/claims/${claim.id}`}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
