import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimsAPI } from '../utils/api';
import { format } from 'date-fns';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Shield
} from 'lucide-react';

export default function ClaimDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    rejectionReason: '',
    amountApproved: ''
  });

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      const response = await claimsAPI.getById(id);
      setClaim(response.data.claim);
    } catch (error) {
      console.error('Failed to load claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setSubmittingNote(true);
    try {
      await claimsAPI.addNote(id, { note });
      setNote('');
      loadClaim();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await claimsAPI.updateStatus(id, statusUpdate);
      loadClaim();
      setStatusUpdate({ status: '', rejectionReason: '', amountApproved: '' });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update claim status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'under_review': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      submitted: 'badge-submitted',
      under_review: 'badge-under-review',
      approved: 'badge-approved',
      rejected: 'badge-rejected'
    };
    return <span className={`badge ${classes[status]}`}>{status.replace('_', ' ')}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Claim not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Claim Info Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{claim.claimNumber}</h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-gray-600">
              Submitted on {format(new Date(claim.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(claim.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Policy Number</h3>
            <p className="mt-1 text-gray-900">{claim.policy.policyNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Claim Type</h3>
            <p className="mt-1 text-gray-900 capitalize">{claim.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount Claimed</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              ${parseFloat(claim.amountClaimed).toLocaleString()}
            </p>
          </div>
          {claim.amountApproved && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount Approved</h3>
              <p className="mt-1 text-lg font-semibold text-green-600">
                ${parseFloat(claim.amountApproved).toLocaleString()}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Incident Date</h3>
            <p className="mt-1 text-gray-900">
              {format(new Date(claim.incidentDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Claimant</h3>
            <p className="mt-1 text-gray-900">{claim.user.name}</p>
            <p className="text-sm text-gray-600">{claim.user.email}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900">{claim.description}</p>
          </div>
          {claim.rejectionReason && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
              <p className="text-red-700">{claim.rejectionReason}</p>
            </div>
          )}
          {claim.autoApproved && (
            <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  This claim was automatically approved after passing all validation checks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      {claim.documents && claim.documents.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claim.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.fileName}</p>
                    <p className="text-sm text-gray-600 capitalize">{doc.docType}</p>
                  </div>
                </div>
                <a
                  href={`http://localhost:5000${doc.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {claim.validations && claim.validations.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h2>
          <div className="space-y-2">
            {claim.validations.map((validation) => (
              <div
                key={validation.id}
                className={`p-4 rounded-lg border ${
                  validation.result === 'passed'
                    ? 'bg-green-50 border-green-200'
                    : validation.result === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {validation.result === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {validation.result === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                    {validation.result === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                    <span className="font-medium text-gray-900">{validation.ruleName}</span>
                  </div>
                  <span className={`badge ${
                    validation.result === 'passed'
                      ? 'badge-approved'
                      : validation.result === 'failed'
                      ? 'badge-rejected'
                      : 'badge-under-review'
                  }`}>
                    {validation.result}
                  </span>
                </div>
                {validation.details?.message && (
                  <p className="mt-2 text-sm text-gray-700">{validation.details.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update (Insurer/Admin Only) */}
      {(user.role === 'insurer' || user.role === 'admin') && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Claim Status</h2>
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                required
                className="input"
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              >
                <option value="">Select status...</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {statusUpdate.status === 'approved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="Enter approved amount"
                  value={statusUpdate.amountApproved}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, amountApproved: e.target.value })}
                />
              </div>
            )}

            {statusUpdate.status === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  required
                  rows={3}
                  className="input"
                  placeholder="Explain why the claim is being rejected..."
                  value={statusUpdate.rejectionReason}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, rejectionReason: e.target.value })}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={updatingStatus || !statusUpdate.status}
              className="btn btn-primary"
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}

      {/* Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Notes & Comments</span>
        </h2>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-6">
          <textarea
            rows={3}
            className="input"
            placeholder="Add a note or comment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="submit"
            disabled={submittingNote || !note.trim()}
            className="btn btn-primary mt-2"
          >
            {submittingNote ? 'Adding...' : 'Add Note'}
          </button>
        </form>

        {/* Notes List */}
        <div className="space-y-4">
          {claim.notes && claim.notes.length > 0 ? (
            claim.notes.map((note) => (
              <div key={note.id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{note.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-gray-700">{note.note}</p>
                {note.isInternal && (
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Internal Note
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
