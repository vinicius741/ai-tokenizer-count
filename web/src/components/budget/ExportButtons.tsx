/**
 * Export Buttons Component
 *
 * Buttons for copying selected books to clipboard and downloading as JSON.
 * Uses utility hooks for clipboard and JSON download functionality.
 */

import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCopyToClipboard } from '@/lib/clipboard-utils';
import { useJsonDownload } from '@/lib/json-download';
import type { EpubResult } from '@epub-counter/shared';

interface ExportButtonsProps {
  /** Selected EPUB results */
  books: EpubResult[];
  /** Tokenizer name */
  tokenizer: string;
  /** Budget used */
  budget: number;
  /** Strategy used */
  strategy: string;
}

/**
 * Export Buttons
 *
 * Renders two buttons:
 * - Copy: Copies formatted text to clipboard
 * - Download JSON: Downloads JSON file with selection data
 *
 * Shows toast notifications on success/error.
 *
 * @param props - Component props
 * @returns React component
 */
export function ExportButtons({
  books,
  tokenizer,
  budget,
  strategy,
}: ExportButtonsProps) {
  const { copy: copyToClipboard } = useCopyToClipboard(tokenizer);
  const { download: downloadJson } = useJsonDownload();

  // Handle copy to clipboard
  const handleCopy = async () => {
    const success = await copyToClipboard(books);
    if (success) {
      toast.success('Copied to clipboard', {
        description: `${books.length} book${books.length !== 1 ? 's' : ''} copied to clipboard`,
      });
    } else {
      toast.error('Failed to copy', {
        description: 'Could not copy to clipboard. Please try again.',
      });
    }
  };

  // Handle JSON download
  const handleDownload = () => {
    try {
      downloadJson(books, budget, tokenizer, strategy);
      toast.success('Download started', {
        description: 'budget-selection-{timestamp}.json',
      });
    } catch (error) {
      toast.error('Download failed', {
        description: 'Could not download JSON file. Please try again.',
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* Copy button */}
      <Button
        variant="outline"
        onClick={handleCopy}
        disabled={books.length === 0}
        className="flex-1"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>

      {/* Download JSON button */}
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={books.length === 0}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        Download JSON
      </Button>
    </div>
  );
}
