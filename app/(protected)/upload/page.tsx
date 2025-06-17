"use client";

import { useEffect, useRef, useState } from 'react';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import {
  validateCsvFormat,
  detectDuplicates,
  CsvValidationError,
} from '@/lib/validateCsv';
import { fetchUpload } from '@/lib/api';
import { parseCsvFile } from '@/lib/parseCsv';

type CsvRow = Record<string, string>;

const csvFormats: { name: string; fields: string[] }[] = [
  {
    name: "Format A",
    fields: [
      "Location_ID",
      "Product_Name",
      "Scancode",
      "Trans_Date",
      "Price",
      "Total_Amount",
    ],
  },
  {
    name: "Format B",
    fields: [
      "Site_Code",
      "Item_Description",
      "UPC",
      "Sale_Date",
      "Unit_Price",
      "Final_Total",
    ],
  },
];

const UploadPage = () => {
  useProtectedRoute();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [lastFileInfo, setLastFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastUploadedFile");
    if (saved) {
      setLastFileInfo(JSON.parse(saved));
    }
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setMessage("");
    if (!file) return;

    if (
      lastFileInfo &&
      file.name === lastFileInfo.name &&
      file.size === lastFileInfo.size
    ) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("This file has already been uploaded. Select another file");
      setMessage("");
      return;
    }

    localStorage.setItem(
      "lastUploadedFile",
      JSON.stringify({ name: file.name, size: file.size })
    );
    setLastFileInfo({ name: file.name, size: file.size });
    setFileName(file.name);
    setLoading(true);

    try {
      const data = await parseCsvFile<CsvRow>(file);
      validateCsvFormat(data);
      const duplicates = detectDuplicates(data);
      if (duplicates.length > 0) {
        setError(
          `Found ${duplicates.length} duplicate entries. Please check your data.`
        );
        setMessage("");
        setLoading(false);
        return;
      }
      const normalized = data.map((row) => {
        const isFormatA = "Location_ID" in row;
        return {
          location_code: isFormatA ? row.Location_ID : row.Site_Code,
          product_name: isFormatA ? row.Product_Name : row.Item_Description,
          product_upc: isFormatA ? row.Scancode : row.UPC,
          quantity: 1,
          sold_at: isFormatA
            ? new Date(row.Trans_Date).toISOString().slice(0, 10)
            : row.Sale_Date,
        };
      });
      const json = await fetchUpload(normalized);

      if (!json.ok) {
        setError(json.message || "Failed to upload data");
        setMessage("");
        setLoading(false);
        return;
      }
      setMessage(json.message || "Uploaded successfully");
      setError("");
    } catch (err) {
      if (err instanceof CsvValidationError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
      setMessage("");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fakeEvent = {
        target: { files: e.dataTransfer.files },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFile(fakeEvent);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-4 sm:p-8 mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Upload Sales Data
        </h1>

        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors flex flex-col items-center justify-center min-h-[180px] ${
              dragActive ? "border-blue-500" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              disabled={loading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center w-full"
              onClick={() => {
                setError("");
                setMessage("");
              }}
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-gray-600 mb-1 text-base sm:text-lg">
                {fileName || "Click or tap to upload CSV file"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                Supports .csv files up to 10MB
              </span>
            </label>
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600 text-base">
                Processing...
              </span>
            </div>
          )}

          {(error || message) && (
            <div
              className={`mt-4 p-4 rounded-lg border flex items-center ${
                message
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <svg
                className={`w-5 h-5 mr-2 ${
                  message ? "text-green-400" : "text-red-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    message
                      ? "M5 13l4 4L19 7"
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                />
              </svg>
              <p
                className={`text-sm sm:text-base ${
                  message ? "text-green-600" : "text-red-600"
                }`}
              >
                {message || error}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center sm:text-left">
            Supported CSV Formats
          </h2>
          <div className="flex flex-col gap-4">
            {csvFormats.map((format) => (
              <div className="flex-1" key={format.name}>
                <h3 className="font-medium text-gray-700 mb-2 text-center sm:text-left">
                  {format.name}
                </h3>
                <div className="bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                  <code className="text-sm text-gray-600">
                    {format.fields.join(",")}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
