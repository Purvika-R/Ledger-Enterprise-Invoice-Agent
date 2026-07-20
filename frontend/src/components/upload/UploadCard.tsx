import { useState } from "react";
import api from "../../services/api";

type Props = {
  onProcessed: (data: any) => void;
  setProcessing: (value: boolean) => void;
  clearProgress: () => void;
};

export default function UploadCard({
  onProcessed,
  setProcessing,
  clearProgress,
}: Props) {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    clearProgress();

    setProcessing(true);

    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await api.post(
        "/process-invoice",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onProcessed(response.data);
    } catch (error) {
      console.error(error);
      alert("Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-semibold">
        Upload Invoice
      </h2>

      <div className="rounded-xl border-2 border-dashed border-slate-300 p-6">

        <div className="text-center">

          <label className="cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">

            Choose Invoice

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={handleUpload}
            />

          </label>

        </div>

        {fileName && (
          <div className="mt-6">

            <p className="font-semibold">
              Selected File
            </p>

            <p className="text-slate-600">
              {fileName}
            </p>

          </div>
        )}

        {preview && (
          <div className="mt-6">

            <h3 className="mb-3 text-lg font-semibold">
              Invoice Preview
            </h3>

            <img
              src={preview}
              alt="Invoice Preview"
              className="w-full rounded-lg border"
              style={{
                maxHeight: "500px",
                objectFit: "contain",
              }}
            />

          </div>
        )}

      </div>

    </div>
  );
}