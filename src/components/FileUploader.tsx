"use client";

import { useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [response, setResponse] = useState<any>(null);

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upload Files</h2>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload & Parse
      </button>

      {response && (
        <pre className="mt-4 bg-gray-200 p-3 rounded">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
