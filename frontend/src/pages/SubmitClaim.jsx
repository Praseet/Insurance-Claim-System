import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsAPI, policiesAPI } from '../utils/api';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function SubmitClaim() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [policies, setPolicies] = useState([]);
  
  const [formData, setFormData] = useState({
    policyNumber: '',
    type: 'health',
    amountClaimed: '',
    incidentDate: '',
    description: ''
  });
  
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const response = await policiesAPI.getAll();
      setPolicies(response.data.policies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('policyNumber', formData.policyNumber);
      submitData.append('type', formData.type);
      submitData.append('amountClaimed', formData.amountClaimed);
      submitData.append('incidentDate', formData.incidentDate);
      submitData.append('description', formData.description);

      files.forEach((file) => {
        submitData.append('documents', file);
      });

      const response = await claimsAPI.create(submitData);
      navigate(`/claims/${response.data.claim.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.policyNumber) {
      setError('Please select a policy');
      return;
    }
    if (step === 2 && (!formData.amountClaimed || !formData.incidentDate || !formData.description)) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submit New Claim</h1>
        <p className="text-gray-600 mt-1">Fill in the details to submit your insurance claim</p>
      </div>

      {/* Progress Steps */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? <CheckCircle className="h-6 w-6" /> : s}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {s === 1 && 'Policy'}
                    {s === 2 && 'Details'}
                    {s === 3 && 'Documents'}
                    {s === 4 && 'Review'}
                  </p>
                </div>
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    s < step ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Step 1: Select Policy */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Policy</h2>
            
            {policies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No active policies found. Please contact your insurer.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {policies.map((policy) => (
                  <label
                    key={policy.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.policyNumber === policy.policyNumber
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      value={policy.policyNumber}
                      checked={formData.policyNumber === policy.policyNumber}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          policyNumber: e.target.value,
                          type: policy.type
                        });
                      }}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{policy.policyNumber}</p>
                        <p className="text-sm text-gray-600 capitalize">{policy.type} Insurance</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(policy.coverageAmount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Coverage</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Claim Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Claim Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="input pl-8"
                  placeholder="0.00"
                  value={formData.amountClaimed}
                  onChange={(e) => setFormData({ ...formData, amountClaimed: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Date *
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                className="input"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="input"
                placeholder="Provide details about the incident..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters. Be as detailed as possible.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Upload Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="btn btn-primary">Choose Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Upload bills, reports, photos, or other supporting documents
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: JPG, PNG, PDF (Max 10MB per file)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Selected Files ({files.length})</h3>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Policy Number</p>
                <p className="font-medium text-gray-900">{formData.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Claim Type</p>
                <p className="font-medium text-gray-900 capitalize">{formData.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Claim Amount</p>
                <p className="font-medium text-gray-900">
                  ${parseFloat(formData.amountClaimed).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Incident Date</p>
                <p className="font-medium text-gray-900">{formData.incidentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium text-gray-900">{formData.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="font-medium text-gray-900">{files.length} file(s) attached</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once submitted, your claim will be automatically validated.
                Small claims may be auto-approved if all checks pass.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
