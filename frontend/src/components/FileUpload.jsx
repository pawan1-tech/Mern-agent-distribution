import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = ['.csv', '.xlsx', '.xls'];

  const validateFile = (file) => {
    const isValidType = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      toast.error('Only CSV, XLSX, and XLS files are allowed');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadResult(response.data.data);
      toast.success('File uploaded and distributed successfully!');
      onUploadSuccess?.(); // Call the callback to refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadResult(null);
  };

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Upload className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Upload & Distribute Records</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">Drop your file here or click to browse</p>
            <p className="text-xs mt-1">Supports CSV, XLSX, XLS files (max 5MB)</p>
          </div>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-secondary cursor-pointer inline-flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Choose File
          </label>
        </div>

        {file && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Required CSV Format:</h4>
          <div className="text-xs text-blue-800 font-mono bg-blue-100 p-2 rounded">
            FirstName,Phone,Notes<br/>
            John Doe,9876543210,Follow up required<br/>
            Jane Smith,9876543211,Interested in product
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Upload & Distribute
            </>
          )}
        </button>
      </form>

      {uploadResult && (
        <div className="mt-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-sm font-medium text-green-900">Upload Successful!</h4>
            </div>
            <div className="text-sm text-green-800">
              <p><strong>File:</strong> {uploadResult.distribution.fileName}</p>
              <p><strong>Total Records:</strong> {uploadResult.summary.totalRecords}</p>
              <p><strong>Skipped:</strong> {uploadResult.summary.skippedCount}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Distribution Summary
            </h4>
            <div className="space-y-2">
              {uploadResult.summary.recordsPerAgent.map((agent, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-700">{agent.agentName}</span>
                  <span className="text-sm font-medium text-blue-600">{agent.recordCount} records</span>
                </div>
              ))}
            </div>
          </div>

          {uploadResult.validationErrors && uploadResult.validationErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="text-sm font-medium text-yellow-900">Skipped Rows</h4>
              </div>
              <div className="text-xs text-yellow-800 max-h-32 overflow-y-auto">
                {uploadResult.validationErrors.map((error, index) => (
                  <div key={index} className="py-1">
                    Row {error.row}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
