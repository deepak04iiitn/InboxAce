"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface BulkImportDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportDialog({
  onClose,
  onSuccess,
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        toast.error("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `recipientName,recipientEmail,recipientGender,position,company,emailType,customSubject,customBody,notes,tags
John Doe,john@company.com,MALE,Software Engineer,Tech Corp,APPLICATION,Application for Software Engineer,Dear John...,Referred by Sarah,tech;urgent
Jane Smith,jane@startup.io,FEMALE,Product Manager,Startup Inc,APPLICATION,,,Met at conference,startup;pm`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/jobs/bulk-import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        toast.success(data.message || "Import completed!");
        if (data.imported > 0) {
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (error) {
      toast.error("An error occurred during import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl max-w-2xl w-full"
      >
        {/* Header */}
        <div className="border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bulk Import Jobs
              </h2>
              <p className="text-gray-400 text-sm">
                Import multiple jobs from CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Premium Feature Badge */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Premium Feature</div>
                <div className="text-gray-300 text-sm">
                  Bulk import is available for Plus and Pro users
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
              <li>Download the CSV template</li>
              <li>Fill in your job details (required: recipientName, recipientEmail, position, company)</li>
              <li>Upload the completed CSV file</li>
              <li>Review and import</li>
            </ol>
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 px-4 py-3 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-700/50 rounded-lg p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <div className="text-white mb-2">
                {file ? file.name : "Choose a CSV file"}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg cursor-pointer transition"
              >
                Select File
              </label>
            </div>
          </div>

          {/* Upload Button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import Jobs"}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="text-green-300">
                  Successfully imported {result.imported} jobs
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="text-red-300 font-semibold">
                      {result.errors.length} errors found
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {result.errors.slice(0, 5).map((error: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm text-red-300 bg-red-900/20 rounded p-2"
                      >
                        <strong>Row {error.row}:</strong> {error.error}
                      </div>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="text-sm text-red-300 text-center">
                        ... and {result.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
