import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { TokenizerSelector } from './components/tokenizer/TokenizerSelector'
import { FileDropzone } from './components/file-upload/FileDropzone'
import { FolderInput } from './components/processing/FolderInput'
import { ProcessButton } from './components/processing/ProcessButton'
import { ProcessingProgress } from './components/progress/ProcessingProgress'
import { CompletionSummary } from './components/progress/CompletionSummary'
import { TokenizerBarChart } from './components/visualization/BarChart'
import { TokenDensityScatter } from './components/visualization/ScatterChart'
import { ChartContainer } from './components/visualization/ChartContainer'
import { ResultsTable } from './components/visualization/ResultsTable'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ResultsOutput } from '@epub-counter/shared'

/**
 * Get display name for a tokenizer ID
 */
function getTokenizerDisplayName(tokenizerId: string): string {
  const displayNames: Record<string, string> = {
    gpt4: 'GPT-4',
    claude: 'Claude',
  }
  // For HF models, remove the 'hf:' prefix and use the model name
  if (tokenizerId.startsWith('hf:')) {
    return tokenizerId.slice(3)
  }
  return displayNames[tokenizerId] ?? tokenizerId
}

function App() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [processingResults, setProcessingResults] = useState<ResultsOutput | null>(null)
  const [isCancelled, setIsCancelled] = useState(false)
  const [folderPath, setFolderPath] = useState('')
  const [selectedTokenizers, setSelectedTokenizers] = useState<string[]>([])

  const handleFileLoaded = (data: ResultsOutput, fileName: string) => {
    setProcessingResults(data) // Show uploaded results immediately
    setIsCancelled(false)
    console.log('Uploaded results:', fileName, data)
  }

  const handleJobStarted = (jobId: string) => {
    setCurrentJobId(jobId)
    setProcessingResults(null)
    setIsCancelled(false)
    console.log('Job started:', jobId)
  }

  const handleProcessingComplete = (results: ResultsOutput) => {
    setProcessingResults(results)
    setCurrentJobId(null)
    setIsCancelled(false)
  }

  const handleCancel = () => {
    setCurrentJobId(null)
    setIsCancelled(true)
  }

  const handleReset = () => {
    // Reset all state
    setCurrentJobId(null)
    setProcessingResults(null)
    setIsCancelled(false)
    setFolderPath('')
    // Note: We don't reset selectedTokenizers to remember user preference
  }

  const isProcessing = !!currentJobId && !processingResults

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>EPUB Tokenizer Counter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tokenizer Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">1. Select Tokenizers</h2>
              <TokenizerSelector onSelectionChange={setSelectedTokenizers} />
            </div>

            {/* File Upload OR Folder Input */}
            {!isProcessing && !processingResults && !isCancelled && (
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
            )}

            {/* Process Button */}
            {!isProcessing && !processingResults && !isCancelled && (
              <div>
                <ProcessButton
                  folderPath={folderPath}
                  selectedTokenizers={selectedTokenizers}
                  onJobStarted={handleJobStarted}
                  onCancel={handleCancel}
                  isProcessing={false}
                />
              </div>
            )}

            {/* Progress Display */}
            {isProcessing && (
              <div>
                <h2 className="text-lg font-semibold mb-4">3. Processing Progress</h2>
                <ProcessingProgress
                  jobId={currentJobId!}
                  onComplete={handleProcessingComplete}
                />

                {/* Cancel Button */}
                <div className="mt-4">
                  <ProcessButton
                    folderPath={folderPath}
                    selectedTokenizers={selectedTokenizers}
                    onJobStarted={handleJobStarted}
                    onCancel={handleCancel}
                    isProcessing={true}
                    jobId={currentJobId!}
                  />
                </div>
              </div>
            )}

            {/* Cancelled State */}
            {isCancelled && (
              <div className="space-y-4">
                <div className="p-4 border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Processing was cancelled. Click Reset to start a new process.
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            )}

            {/* Completion Summary */}
            {processingResults && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Complete!</h2>
                  <CompletionSummary results={processingResults} />
                </div>

                {/* Token Count Analysis - Bar Charts */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Token Count Analysis</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {(processingResults.options.tokenizers ?? []).map((tokenizer) => (
                      <ChartContainer
                        key={tokenizer}
                        title={`${getTokenizerDisplayName(tokenizer)} Token Counts`}
                      >
                        <TokenizerBarChart
                          data={processingResults.results}
                          tokenizerName={tokenizer}
                        />
                      </ChartContainer>
                    ))}
                  </div>
                </div>

                {/* Token Density Analysis */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Token Density Analysis</h2>
                  <ChartContainer title="Word Count vs Token Count" height={400}>
                    <TokenDensityScatter
                      data={processingResults.results}
                      tokenizers={processingResults.options.tokenizers ?? []}
                    />
                  </ChartContainer>
                </div>

                {/* Detailed Results Table */}
                <div>
                  <ResultsTable
                    data={processingResults.results}
                    tokenizers={processingResults.options.tokenizers ?? []}
                    primaryTokenizer={processingResults.options.tokenizers?.[0] ?? 'gpt4'}
                  />
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Process Another Batch
                </Button>
              </div>
            )}
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
      </div>
    </div>
  )
}

export default App
