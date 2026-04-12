"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function DriverLicenseUpload({ onSuccess, currentLicense }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "warning"

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(selectedFile.type)) {
      setMessageType("error");
      setMessage("❌ Only JPG, PNG, WEBP, and PDF files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessageType("error");
      setMessage("❌ File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setMessageType("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessageType("error");
      setMessage("❌ Please select a file first");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessageType("error");
        setMessage("❌ Please login first");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("drivingLicense", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/upload-driver-license`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(`❌ ${data.error || "Upload failed"}`);
        setIsLoading(false);
        return;
      }

      setMessageType("success");
      setMessage(`✅ Driver License uploaded! +${data.pointsAwarded} points awarded!`);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("drivingLicenseInput");
      if (fileInput) fileInput.value = "";

      // Call callback to refresh parent component
      if (onSuccess) {
        onSuccess(data.user);
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setMessageType("error");
      setMessage(`❌ Error: ${err.message}`);
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">📋 Driver License</h3>

      {/* Current License Status */}
      <div className="mb-4">
        {currentLicense ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>Driver License Uploaded ✓</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/20 bg-white">
              {currentLicense.toLowerCase().includes(".pdf") ? (
                <div className="p-4">
                  <a
                    href={currentLicense}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Open uploaded driver license
                  </a>
                </div>
              ) : (
                <img
                  src={currentLicense}
                  alt="Driver License"
                  className="w-full max-h-72 object-contain"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle size={20} />
            <span>Driver License Not Uploaded</span>
          </div>
        )}
      </div>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Driver License (JPG, PNG, PDF)
        </label>
        <input
          id="drivingLicenseInput"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileChange}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-400/30 text-white cursor-pointer hover:border-orange-500/50 transition"
        />
        {file && (
          <p className="text-sm text-orange-400 mt-2">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            messageType === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : messageType === "error"
              ? "bg-red-500/20 border border-red-500/30 text-red-300"
              : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
          file && !isLoading
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 cursor-pointer"
            : "bg-gray-500/30 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Upload size={20} />
        {isLoading ? "Uploading..." : "Upload Driver License"}
      </button>
    </div>
  );
}
