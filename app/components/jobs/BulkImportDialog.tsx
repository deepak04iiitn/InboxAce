"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Download, AlertCircle, CheckCircle, Info, ArrowRight } from "lucide-react";
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
    const csvContent = `recipientName,recipientEmail,position,company,recipientGender,emailType,customSubject,customBody,notes,tags
John Doe,john@company.com,Software Engineer,Tech Corp,MALE,APPLICATION,Application for Software Engineer,Dear John...,Referred by Sarah,tech;urgent
Jane Smith,jane@startup.io,Product Manager,Startup Inc,FEMALE,APPLICATION,,,Met at conference,startup;pm`;

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
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="border-b border-gray-700/50 p-6 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Flexible Bulk Import
              </h2>
              <p className="text-gray-400 text-sm">
                Import from any CSV - we'll auto-map your columns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
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
                <div className="text-white font-semibold">Smart Column Mapping</div>
                <div className="text-gray-300 text-sm">
                  Upload any CSV and we'll automatically match columns to fields
                </div>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-blue-300 font-semibold">How Smart Import Works</h3>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>• Upload a CSV with any column names</p>
                  <p>• We automatically detect and map matching fields</p>
                  <p>• Required fields: recipientName, recipientEmail, position, company</p>
                  <p>• Optional fields will use your default template if not provided</p>
                  <p>• Unrecognized columns are simply ignored</p>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Column Names */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span>Recognized Column Names</span>
              <span className="text-xs text-gray-400">(case-insensitive)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-green-400 font-semibold mb-2">✓ Recipient Name</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>recipientName, name, recipient, contact_name</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-green-400 font-semibold mb-2">✓ Email</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>recipientEmail, email, contact_email</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-green-400 font-semibold mb-2">✓ Position</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>position, title, job_title, role</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-green-400 font-semibold mb-2">✓ Company</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>company, organization, org</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-blue-400 font-semibold mb-2">⭘ Subject</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>customSubject, subject, email_subject</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-blue-400 font-semibold mb-2">⭘ Body</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>customBody, body, email_body, message</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-blue-400 font-semibold mb-2">⭘ Tags</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>tags, tag, labels (comma separated)</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-blue-400 font-semibold mb-2">⭘ Notes</div>
                <div className="text-gray-400 text-xs space-y-1">
                  <div>notes, note, comments</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-green-400">✓</span> = Required fields | 
              <span className="text-blue-400"> ⭘</span> = Optional fields
            </div>
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 px-4 py-3 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download Sample Template
          </button>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-700/50 rounded-lg p-8 hover:border-purple-500/50 transition">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <div className="text-white mb-2">
                {file ? file.name : "Choose any CSV file"}
              </div>
              <div className="text-gray-500 text-sm mb-4">
                We'll automatically detect and map your columns
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
              className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import Jobs
                </>
              )}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              {/* Success Message */}
              <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="text-green-300">
                  Successfully imported {result.imported} jobs
                </div>
              </div>

              {/* Column Mapping Info */}
              {result.mapping && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Column Mapping
                  </div>
                  <div className="space-y-2">
                    {result.mapping.mapped.map((mapping: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{mapping.csvColumn}</span>
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300">{mapping.dbField}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <div className="text-yellow-300 font-semibold">Warnings</div>
                  </div>
                  {result.warnings.map((warning: any, index: number) => (
                    <div key={index} className="text-sm text-yellow-300 mt-2">
                      {warning.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Errors */}
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
        <div className="border-t border-gray-700/50 p-6 flex justify-end sticky bottom-0 bg-gray-900/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white cursor-pointer px-6 py-3 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}