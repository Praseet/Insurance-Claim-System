import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    totalApproved: 0
  });

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await claimsAPI.getAll();
      const claimsData = response.data.claims || [];
      setClaims(claimsData);

      // Calculate stats
      const newStats = {
        total: claimsData.length,
        submitted: claimsData.filter(c => c.status === 'submitted').length,
        under_review: claimsData.filter(c => c.status === 'under_review').length,
        approved: claimsData.filter(c => c.status === 'approved').length,
        rejected: claimsData.filter(c => c.status === 'rejected').length,
        totalApproved: claimsData
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + parseFloat(c.amountApproved || 0), 0)
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
      <span className={`badge ${badge.class}`}>
        <Icon className="h-3 w-3" />
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen fade-in">
        <div className="text-center">
          <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your claims today
          </p>
        </div>
        {user.role === 'user' && (
          <Link 
            to="/submit-claim" 
            className="btn btn-primary flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span>Submit New Claim</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Claims</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="stat-card slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-sm text-gray-600 mt-1">Approved Claims</p>
          {stats.approved > 0 && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Success rate
            </p>
          )}
        </div>

        <div className="stat-card slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            {stats.under_review > 0 && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.submitted + stats.under_review}
          </p>
          <p className="text-sm text-gray-600 mt-1">Pending Review</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.submitted} submitted, {stats.under_review} reviewing
          </p>
        </div>

        <div className="stat-card slide-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalApproved.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Approved</p>
          <p className="text-xs text-emerald-600 mt-2">Lifetime earnings</p>
        </div>
      </div>

      {/* Quick Actions */}
      {user.role === 'user' && claims.length > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 slide-up" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Manage your claims efficiently</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/submit-claim" className="btn btn-outline text-sm">
                New Claim
              </Link>
              {stats.under_review > 0 && (
                <Link to="#" className="btn btn-primary text-sm">
                  Track Status
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claims List */}
      <div className="slide-up" style={{animationDelay: '0.6s'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Claims</h2>
          {claims.length > 0 && (
            <span className="text-sm text-gray-500">
              {claims.length} {claims.length === 1 ? 'claim' : 'claims'}
            </span>
          )}
        </div>

        {claims.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Claims Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by submitting your first insurance claim. It's quick, easy, and secure!
            </p>
            {user.role === 'user' && (
              <Link to="/submit-claim" className="btn btn-primary inline-flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Submit Your First Claim
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim, index) => (
              <div
                key={claim.id}
                onClick={() => navigate(`/claims/${claim.id}`)}
                className="card-interactive"
                style={{animationDelay: `${0.7 + index * 0.05}s`}}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {claim.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : claim.status === 'rejected' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : claim.status === 'under_review' ? (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {claim.claimNumber}
                        </h3>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {claim.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(claim.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${parseFloat(claim.amountClaimed).toLocaleString()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium capitalize">
                          {claim.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end gap-3">
                    {claim.status === 'approved' && claim.amountApproved && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Approved Amount</p>
                        <p className="text-xl font-bold text-green-600">
                          ${parseFloat(claim.amountApproved).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <button className="btn btn-outline text-sm flex items-center gap-2 group">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section - Only show if no claims */}
      {claims.length === 0 && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 slide-up" style={{animationDelay: '0.8s'}}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Filing an insurance claim is simple and straightforward. Here's what you need:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Policy Info</p>
                    <p className="text-xs text-gray-600">Your policy number</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Documents</p>
                    <p className="text-xs text-gray-600">Bills, reports, photos</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Details</p>
                    <p className="text-xs text-gray-600">Incident information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
