import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DeliveredFile, DeliveryPayload } from '../types/escrow';

interface DeliverySectionProps {
  delivery?: DeliveryPayload;
  isReviewing: boolean;
  onUpdateDelivery: (payload: DeliveryPayload) => void;
  onLoadDemoDeliveryPreset: (mode: 'COMPLETE' | 'INCOMPLETE') => void;
  onSubmitAndReview: () => void;
}

/**
 * Extracts readable text from uploaded text/SVG/JSON/PDF files on the client
 * and converts raster images to base64 so Gemini Vision can inspect them.
 */
async function processUploadedFile(file: File): Promise<DeliveredFile> {
  const id = `FILE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const isImage = file.type.startsWith('image/');
  const isTextLike =
    file.type.startsWith('text/') ||
    file.type === 'image/svg+xml' ||
    file.name.endsWith('.svg') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.txt');

  if (isImage && file.type !== 'image/svg+xml') {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
    return {
      id,
      name: file.name,
      mimeType: file.type || 'image/png',
      sizeBytes: file.size,
      base64Data,
    };
  }

  if (isTextLike) {
    const text = await file.text();
    return {
      id,
      name: file.name,
      mimeType: file.type || 'text/plain',
      sizeBytes: file.size,
      extractedText: text.slice(0, 3000),
    };
  }

  // For PDFs or binary archives, extract printable ASCII strings as lightweight text preview
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(buffer);
    const printable = raw
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);
    return {
      id,
      name: file.name,
      mimeType: 'application/pdf',
      sizeBytes: file.size,
      extractedText: printable || `PDF Document (${file.name}, ${file.size} bytes)`,
    };
  }

  return {
    id,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  };
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({
  delivery,
  isReviewing,
  onUpdateDelivery,
  onLoadDemoDeliveryPreset,
  onSubmitAndReview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newLink, setNewLink] = useState('');

  const currentDelivery: DeliveryPayload = delivery || {
    submittedAt: new Date().toISOString(),
    note: '',
    links: [],
    files: [],
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const processed: DeliveredFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      processed.push(await processUploadedFile(fileList[i]));
    }
    onUpdateDelivery({
      ...currentDelivery,
      submittedAt: new Date().toISOString(),
      files: [...currentDelivery.files, ...processed],
    });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.trim()) return;
    onUpdateDelivery({
      ...currentDelivery,
      links: [...currentDelivery.links, newLink.trim()],
    });
    setNewLink('');
  };

  const handleRemoveFile = (id: string) => {
    onUpdateDelivery({
      ...currentDelivery,
      files: currentDelivery.files.filter((f) => f.id !== id),
    });
  };

  const handleRemoveLink = (idx: number) => {
    onUpdateDelivery({
      ...currentDelivery,
      links: currentDelivery.links.filter((_, i) => i !== idx),
    });
  };

  return (
    <section
      id="delivery-section"
      className="border border-[#08090B] bg-[#FAF8F3] text-[#08090B]"
    >
      {/* Header Bar with Seed Demo Scenario Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-6 border-b border-[#08090B]">
        <div>
          <div className="font-mono-tech text-[11px] text-[#8A8780] mb-1">
            02. FREELANCER DELIVERY PAYLOAD // VISION + PDF/TEXT EXTRACTION
          </div>
          <h2 className="font-anton text-4xl md:text-5xl leading-none text-[#08090B]">
            DELIVERABLE SUBMISSION LOCKER
          </h2>
        </div>

        {/* One-Click Demo Presets for Complete vs Incomplete Delivery */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onLoadDemoDeliveryPreset('COMPLETE')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#08090B] bg-[#CDF22B] text-[#08090B] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            PRESET A: COMPLETE DELIVERY (3 CONCEPTS + PNG + SVG)
          </button>

          <button
            type="button"
            onClick={() => onLoadDemoDeliveryPreset('INCOMPLETE')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#08090B] bg-[#FFC900] text-[#08090B] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            PRESET B: INCOMPLETE (2 CONCEPTS, NO SVG → PARTIAL)
          </button>
        </div>
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Columns: Uploaded Files + Vision Previews */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#08090B] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono-tech text-xs font-bold text-[#08090B]">
              ATTACHED FILES ({currentDelivery.files.length})
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#08090B] bg-[#FAF8F3] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-[11px] transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              UPLOAD FILES (PNG / SVG / PDF / TXT)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>

          {/* Visual Preview Strip for Image Files sent to Gemini Vision */}
          {currentDelivery.files.some((f) => f.base64Data) && (
            <div>
              <div className="font-mono-tech text-[10px] text-[#8A8780] mb-2">
                GEMINI VISION INSPECTION QUEUE (BASE64 INLINE_DATA)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentDelivery.files
                  .filter((f) => f.base64Data)
                  .map((imgFile) => (
                    <div
                      key={imgFile.id}
                      className="border border-[#08090B] bg-[#08090B] text-[#FAF8F3]"
                    >
                      <img
                        src={imgFile.base64Data}
                        alt={imgFile.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-28 object-cover border-b border-[#FAF8F3]/15"
                      />
                      <div className="p-2 font-mono-tech text-[10px] truncate text-[#FAF8F3]">
                        {imgFile.name}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* File Ledger Rows */}
          <div className="border border-[#08090B] divide-y divide-[#08090B]/15">
            {currentDelivery.files.length === 0 ? (
              <div className="p-8 text-center font-mono-tech text-xs text-[#8A8780]">
                NO FILES ATTACHED YET. UPLOAD FILES OR CLICK PRESET A / PRESET B ABOVE.
              </div>
            ) : (
              currentDelivery.files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#08090B]/[0.02]"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {file.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-3.5 h-3.5 text-[#08090B] shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#08090B] shrink-0" />
                      )}
                      <span className="font-mono-tech text-xs font-bold text-[#08090B] truncate">
                        {file.name}
                      </span>
                      <span className="font-mono-tech text-[10px] text-[#8A8780]">
                        · {(file.sizeBytes / 1024).toFixed(1)} KB · {file.mimeType}
                      </span>
                    </div>
                    {file.extractedText && (
                      <div className="font-mono-tech text-[10px] text-[#8A8780] bg-[#08090B]/5 p-2 border border-[#08090B]/15 line-clamp-2">
                        EXTRACTED TEXT: {file.extractedText}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-[#8A8780] hover:text-[#FF6845] transition-colors shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Columns: Delivery Note, Links, and Submit to AI Review CTA */}
        <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1.5">
                FREELANCER DELIVERY NOTE
              </label>
              <textarea
                rows={4}
                value={currentDelivery.note}
                onChange={(e) =>
                  onUpdateDelivery({
                    ...currentDelivery,
                    note: e.target.value,
                  })
                }
                placeholder="Describe delivered concepts, file formats, and completed revisions..."
                className="w-full bg-transparent border border-[#08090B] p-3 text-sm font-inter text-[#08090B] focus:outline-none focus:border-[#CDF22B]"
              />
            </div>

            {/* External Deliverable Links */}
            <div>
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1.5">
                REPOSITORY / FIGMA / DRIVE LINKS ({currentDelivery.links.length})
              </label>
              <div className="space-y-1.5 mb-3">
                {currentDelivery.links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 border border-[#08090B]/20 font-mono-tech text-[11px]"
                  >
                    <span className="inline-flex items-center gap-2 truncate">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{link}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-[#8A8780] hover:text-[#FF6845] ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddLink} className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://figma.com/file/..."
                  className="flex-1 bg-transparent border-b-2 border-[#08090B] py-1 text-xs font-mono-tech focus:outline-none focus:border-[#CDF22B]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#08090B] font-mono-tech text-[10px] hover:bg-[#08090B] hover:text-[#FAF8F3] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  ADD LINK
                </button>
              </form>
            </div>
          </div>

          <div className="pt-4 border-t border-[#08090B]/15">
            <button
              type="button"
              disabled={isReviewing}
              onClick={onSubmitAndReview}
              className="w-full inline-flex items-center justify-between px-6 py-4 rounded-full border-2 border-[#08090B] bg-[#08090B] text-[#FAF8F3] hover:bg-[#CDF22B] hover:text-[#08090B] font-mono-tech text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
                {isReviewing
                  ? 'GEMINI VERIFYING DELIVERABLES...'
                  : 'SUBMIT DELIVERY & RUN GEMINI VERDICT'}
              </span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
