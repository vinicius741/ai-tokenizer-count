import type { ResultsOutput } from '@epub-counter/shared'
import { FileDropzone } from "./components/file-upload/FileDropzone"
import { TokenizerSelector } from "./components/tokenizer/TokenizerSelector"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function App() {
  const handleFileLoaded = (data: ResultsOutput, fileName: string) => {
    console.log('File loaded:', fileName, data)
  }

  const handleTokenizerChange = (selectedTokenizers: string[]) => {
    console.log('Selected tokenizers:', selectedTokenizers)
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
        {/* Tokenizer Selector Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tokenizer Selection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test the TokenizerSelector component for selecting GPT-4, Claude, and Hugging Face models.
            </p>
            <TokenizerSelector onSelectionChange={handleTokenizerChange} />
          </CardContent>
        </Card>

        {/* File Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test the FileDropzone component by dragging a results.json file or clicking to browse.
            </p>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => downloadSample('sample-results.json')}>
                Download Valid Sample
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadSample('invalid-results.json')}>
                Download Invalid Sample
              </Button>
            </div>

            <FileDropzone onFileLoaded={handleFileLoaded} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground font-semibold">Tokenizer Selector:</p>
            <p className="text-muted-foreground">1. Click GPT-4 and Claude chips to toggle them on/off</p>
            <p className="text-muted-foreground">2. Click Hugging Face dropdown to open model selector</p>
            <p className="text-muted-foreground">3. Type in search to filter HF models</p>
            <p className="text-muted-foreground">4. Hover over models to see info card</p>
            <p className="text-muted-foreground">5. Select HF models and verify badges appear below</p>
            <p className="text-muted-foreground">6. Click X on HF badges to remove them</p>
            <p className="text-muted-foreground">7. Deselect all tokenizers to see validation error</p>
            <p className="text-muted-foreground">8. Refresh page to verify localStorage persistence</p>
            <p className="text-muted-foreground">9. Check console for selected tokenizer logs</p>
            <p className="text-muted-foreground mt-3 font-semibold">File Upload:</p>
            <p className="text-muted-foreground">1. Drag a file over the drop zone and verify it expands</p>
            <p className="text-muted-foreground">2. Drag away and verify it returns to normal</p>
            <p className="text-muted-foreground">3. Drop valid sample-results.json and verify FileChip appears</p>
            <p className="text-muted-foreground">4. Drop invalid sample and verify error toast appears</p>
            <p className="text-muted-foreground">5. Click drop zone and verify file picker opens</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
