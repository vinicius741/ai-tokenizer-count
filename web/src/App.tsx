import { useState } from 'react'
import { TokenizerSelector } from './components/tokenizer/TokenizerSelector'
import { FileDropzone } from './components/file-upload/FileDropzone'
import { FolderInput } from './components/processing/FolderInput'
import { ProcessButton } from './components/processing/ProcessButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ResultsOutput } from '@epub-counter/shared'

function App() {
  const [uploadedResults, setUploadedResults] = useState<ResultsOutput | null>(null)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState('')
  const [selectedTokenizers, setSelectedTokenizers] = useState<string[]>([])

  const handleFileLoaded = (data: ResultsOutput, fileName: string) => {
    setUploadedResults(data)
    console.log('Uploaded results:', fileName, data)
  }

  const handleJobStarted = (jobId: string) => {
    setCurrentJobId(jobId)
    console.log('Job started:', jobId)
  }

  const handleTokenizerSelectionChange = (tokenizers: string[]) => {
    setSelectedTokenizers(tokenizers)
    console.log('Selected tokenizers:', tokenizers)
  }

  const downloadSample = (filename: string) => {
    fetch(`/${filename}`)
      .then(res => res.text())
      .then(text => {
        const blob = new Blob([text], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Interface */}
        <Card>
          <CardHeader>
            <CardTitle>EPUB Tokenizer Counter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tokenizer Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">1. Select Tokenizers</h2>
              <TokenizerSelector onSelectionChange={handleTokenizerSelectionChange} />
            </div>

            {/* File Upload OR Folder Input */}
            <div>
              <h2 className="text-lg font-semibold mb-4">2. Choose Input Source</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Upload existing results.json
                  </label>
                  <FileDropzone onFileLoaded={handleFileLoaded} />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or process new EPUBs
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    EPUB folder path (server-side)
                  </label>
                  <FolderInput
                    value={folderPath}
                    onChange={setFolderPath}
                  />
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div>
              <ProcessButton
                folderPath={folderPath}
                selectedTokenizers={selectedTokenizers}
                onJobStarted={handleJobStarted}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Samples Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Samples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Download sample files for testing the file upload functionality:
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => downloadSample('sample-results.json')}>
                Download Valid Sample
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadSample('invalid-results.json')}>
                Download Invalid Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info - Remove in production */}
        {currentJobId && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm">Current Job ID: {currentJobId}</p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground font-semibold">Tokenizer Selection:</p>
            <p className="text-muted-foreground">1. Click GPT-4 and Claude chips to toggle them on/off</p>
            <p className="text-muted-foreground">2. Click Hugging Face dropdown to open model selector</p>
            <p className="text-muted-foreground">3. Type in search to filter HF models</p>
            <p className="text-muted-foreground">4. Hover over models to see info card</p>
            <p className="text-muted-foreground">5. Select HF models and verify badges appear below</p>
            <p className="text-muted-foreground">6. Click X on HF badges to remove them</p>
            <p className="text-muted-foreground">7. Deselect all tokenizers to see validation error</p>
            <p className="text-muted-foreground">8. Refresh page to verify localStorage persistence</p>
            <p className="text-muted-foreground mt-3 font-semibold">File Upload:</p>
            <p className="text-muted-foreground">1. Drag a file over the drop zone and verify it expands</p>
            <p className="text-muted-foreground">2. Drag away and verify it returns to normal</p>
            <p className="text-muted-foreground">3. Drop valid sample-results.json and verify FileChip appears</p>
            <p className="text-muted-foreground">4. Drop invalid sample and verify error toast appears</p>
            <p className="text-muted-foreground">5. Click drop zone and verify file picker opens</p>
            <p className="text-muted-foreground mt-3 font-semibold">Processing Controls:</p>
            <p className="text-muted-foreground">1. Click edit button on folder input to enter path</p>
            <p className="text-muted-foreground">2. Press Enter to save or Escape to cancel</p>
            <p className="text-muted-foreground">3. Verify process button is disabled without tokenizers</p>
            <p className="text-muted-foreground">4. Verify process button is disabled without folder path</p>
            <p className="text-muted-foreground">5. Select tokenizers and enter path to enable button</p>
            <p className="text-muted-foreground">6. Click process button to start processing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
