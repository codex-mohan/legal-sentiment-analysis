"use client";

import { useState, useRef, DragEvent } from "react"; // Import useRef and DragEvent
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // State for drag over effect
  const dragCounter = useRef(0); // Ref to track drag enter/leave events

  const handleFileChange = (files: FileList | null) => {
    setSelectedFiles(files);
    setAnalysisResults(null); // Clear previous results
    setError(null); // Clear previous errors
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select files to upload.");
      return;
    }

    console.log("Selected Files:", selectedFiles);

    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file instanceof File) {
        formData.append("files", file);
      }
    }

    try {
      // Replace with your backend API endpoint
      const response = await fetch("http://localhost:8000/analyze-sentiment/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "An error occurred during analysis."
        );
      }

      const data = await response.json();
      setAnalysisResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    // Main container with animated background (conceptually, actual animation might be in layout.tsx)
    // and centering. Added glassmorphism styles.
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Detached Navigation Bar */}
      <nav className="w-full max-w-4xl flex justify-between items-center mb-8 p-4 bg-neutral-900 bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl border border-neutral-700">
        {/* Left Section: Title */}
        <div className="text-xl font-semibold text-gray-200">
          Legal Sentiment Analyzer
        </div>
        {/* Right Section: Github Stars */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Github Stars</span>
          <a
            href="https://github.com/your-username/legal-sentiment-analysis" // TODO: Replace with actual repo link
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </nav>

      {/* Glassmorphism container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-neutral-900 bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-8 w-full max-w-4xl relative border border-neutral-700 ${isDragging ? "border-4 border-dashed border-blue-500" : ""} align-middle justify-center`}
      >
        {/* Flex container for left and right panels */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: File Upload and Drag and Drop */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-r-0 md:border-r border-gray-600 relative">
            {/* Fancy line separator (conceptually, using border-r) */}
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Upload Documents
            </h2>
            <div className="w-full text-center">
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 ${isDragging ? "border-4 border-dashed border-blue-500" : "border-gray-600"}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOCX, etc.</p>{" "}
                  {/* Update allowed file types */}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </label>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-4 w-full">
                <h3 className="text-lg font-semibold mb-2 text-gray-200">
                  Selected Files:
                </h3>
                <ul className="list-disc list-inside text-gray-400">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <motion.button
              onClick={handleUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || loading}
              className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition duration-200 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Analyzing..." : "Analyze Sentiment"}
            </motion.button>

            {error && (
              <div className="mt-4 text-red-400 text-sm">Error: {error}</div>
            )}
          </div>

          {/* Right Panel: Analysis Results */}
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Analysis Results
            </h2>
            {analysisResults && analysisResults.length > 0 ? (
              <div className="space-y-6">
                {" "}
                {/* Increased spacing between results */}
                {analysisResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 bg-opacity-50 p-6 rounded-md shadow-md"
                  >
                    {" "}
                    {/* Added glassmorphism to result boxes */}
                    <h3 className="text-xl font-semibold mb-3 text-gray-200">
                      {result.filename}
                    </h3>
                    {result.error ? (
                      <p className="text-red-400 text-sm">
                        Error: {result.error}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {" "}
                        {/* Increased spacing within result details */}
                        <p className="text-gray-400">
                          <strong>Sentiment:</strong>{" "}
                          <span className="font-medium text-gray-200">
                            {result.sentiment}
                          </span>
                        </p>
                        {/* Summary area with more space */}
                        <div>
                          <p className="text-gray-400 mb-1">
                            <strong>Summary:</strong>
                          </p>
                          <p className="text-gray-200 leading-relaxed">
                            {result.summary}
                          </p>{" "}
                          {/* Added leading-relaxed for better readability */}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                Upload documents to see analysis results here.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
