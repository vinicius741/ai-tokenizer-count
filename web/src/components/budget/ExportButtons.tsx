/**
 * Export Buttons Component
 *
 * Buttons for copying selected books to clipboard and downloading as JSON.
 * Uses utility hooks for clipboard and JSON download functionality.
 */

import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
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
 * Shows spinner during async operations.
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
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { copy: copyToClipboard } = useCopyToClipboard(tokenizer);
  const { download: downloadJson } = useJsonDownload();

  // Handle copy to clipboard
  const handleCopy = async () => {
    setIsCopying(true);
    try {
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
    } finally {
      setIsCopying(false);
    }
  };

  // Handle JSON download
  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadJson(books, budget, tokenizer, strategy);
      toast.success('Download started', {
        description: 'budget-selection-{timestamp}.json',
      });
    } catch (error) {
      toast.error('Download failed', {
        description: 'Could not download JSON file. Please try again.',
      });
    } finally {
      // Small delay to show spinner for visual feedback
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Copy button */}
      <Button
        variant="outline"
        onClick={handleCopy}
        disabled={books.length === 0 || isCopying}
        className="flex-1"
      >
        {isCopying ? (
          <>
            <Spinner className="mr-2" size="sm" />
            Copying...
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </>
        )}
      </Button>

      {/* Download JSON button */}
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={books.length === 0 || isDownloading}
        className="flex-1"
      >
        {isDownloading ? (
          <>
            <Spinner className="mr-2" size="sm" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </>
        )}
      </Button>
    </div>
  );
}
