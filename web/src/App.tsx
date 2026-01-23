import type { ResultsOutput } from '@epub-counter/shared'
import { FileDropzone } from "./components/file-upload/FileDropzone"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function App() {
  const handleFileLoaded = (data: ResultsOutput, fileName: string) => {
    console.log('File loaded:', fileName, data)
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
      <div className="max-w-xl mx-auto space-y-6">
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
            <p className="text-muted-foreground">1. Start the dev server: <code>npm run dev</code></p>
            <p className="text-muted-foreground">2. Open http://localhost:5173</p>
            <p className="text-muted-foreground">3. Download sample files using the buttons above</p>
            <p className="text-muted-foreground">4. Drag a file over the drop zone and verify it expands (scale animation)</p>
            <p className="text-muted-foreground">5. Drag away and verify it returns to normal</p>
            <p className="text-muted-foreground">6. Drop the valid sample-results.json and verify FileChip appears</p>
            <p className="text-muted-foreground">7. Drop the invalid sample and verify error toast appears</p>
            <p className="text-muted-foreground">8. Click drop zone and verify file picker opens</p>
            <p className="text-muted-foreground">9. Verify FileChip shows file icon, truncated filename, and X button</p>
            <p className="text-muted-foreground">10. Click X button and verify chip disappears, drop zone returns</p>
            <p className="text-muted-foreground">11. Check console for loaded data output</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
