import { formatInrFromUsd, USD_INR_RATE } from '../config';

/**
 * Generates a self-contained PDF file (compliant with PDF 1.4 spec) in the browser
 * and triggers a download so "DOWNLOAD RECEIPT (PDF)" works offline and in iframe sandboxes.
 */
export function downloadProjectReceiptPdf(params: {
  projectId: string;
  title: string;
  clientName: string;
  paidAmountUsd: number;
  paypalAuthorizationId?: string;
  paypalCaptureId?: string;
  completedDate: string;
}) {
  const inrFormatted = formatInrFromUsd(params.paidAmountUsd).replace('₹', 'INR ');
  const lines = [
    'BHAROSA - ESCROW PAYMENT RECEIPT',
    'Tagline: Kaam pura, paisa pura.',
    '------------------------------------------------------------',
    `Receipt Date:        ${params.completedDate}`,
    `Project ID:          ${params.projectId}`,
    `Project Title:       ${params.title.slice(0, 55)}`,
    `Client Name:         ${params.clientName}`,
    '------------------------------------------------------------',
    `Amount Released:     $${params.paidAmountUsd.toFixed(2)} USD`,
    `INR Equivalent:      ${inrFormatted} (at 1 USD = ${USD_INR_RATE} INR)`,
    `PayPal Auth ID:      ${params.paypalAuthorizationId || 'AUTH-SANDBOX'}`,
    `PayPal Capture ID:   ${params.paypalCaptureId || 'CAP-SANDBOX'}`,
    `Payment Status:      PAID (FINAL CAPTURE COMPLETED)`,
    '------------------------------------------------------------',
    'Secured by PayPal Orders v2 & Verified by Bharosa AI.',
  ];

  // Construct minimal valid PDF 1.4 document with Helvetica text stream
  const escapedLines = lines
    .map((line, idx) => {
      const safe = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      return idx === 0
        ? `(${safe}) Tj`
        : `0 -20 Td (${safe}) Tj`;
    })
    .join('\n');

  const streamContent = `BT\n/F1 11 Tf\n50 740 Td\n${escapedLines}\nET`;

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj'
  );
  objects.push(
    `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bharosa-Receipt-${params.projectId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
