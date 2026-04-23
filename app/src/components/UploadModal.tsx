import { useRef, useState } from "react";
import { s } from "../styles";

interface UploadResult {
  count: number;
  ids: string[];
}

interface Props {
  datasource: string;
  onClose: () => void;
  onUploaded: (ids: string[]) => void;
}

export default function UploadModal({ datasource, onClose, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "selected" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function upload() {
    if (!selectedFile) return;
    setStatus("loading");
    setMessage("");
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("datasource", datasource);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data: UploadResult & { error?: string } = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
      setStatus("success");
      setMessage(`✓ ${data.count} document(s) uploaded successfully!`);
      onUploaded(data.ids);
    } catch (err) {
      setStatus("error");
      setMessage(`✗ ${(err as Error).message}`);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const allowed = ["json", "csv", "txt", "md"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.includes(ext)) {
      setStatus("error");
      setMessage("Unsupported format. Use JSON, CSV, TXT or MD.");
      return;
    }
    setSelectedFile(file);
    setStatus("selected");
    setMessage("");
  }

  function handleClear() {
    setSelectedFile(null);
    setStatus("idle");
    setMessage("");
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Upload Documents</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
          Supported formats: <strong>JSON</strong>, <strong>CSV</strong>, <strong>TXT</strong>, <strong>MD</strong>
        </p>

        <div
          style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}), ...(selectedFile ? s.dropzoneSelected : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => status !== "loading" && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv,.txt,.md"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {status === "loading" ? (
            <div style={s.spinner}>
              <div style={s.spinnerCircle} />
              <span style={{ color: "#666", marginTop: 12 }}>Uploading...</span>
            </div>
          ) : selectedFile ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedFile.name}</div>
              <div style={{ color: "#999", fontSize: 13 }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop file here or click to browse</div>
              <div style={{ color: "#999", fontSize: 13 }}>JSON, CSV, TXT, MD</div>
            </>
          )}
        </div>

        {message && (
          <div style={{ ...s.message, ...(status === "success" ? s.messageSuccess : s.messageError) }}>
            {message}
          </div>
        )}

        {status === "selected" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={s.btnSecondary} onClick={handleClear}>Choose another</button>
            <button style={s.btnPrimary} onClick={upload}>Confirm Upload</button>
          </div>
        )}

        {status === "success" && (
          <button style={s.btnPrimary} onClick={onClose}>Done</button>
        )}
      </div>
    </div>
  );
}
