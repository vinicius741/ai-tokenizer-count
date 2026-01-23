import type { EpubMetadata, TokenizerType } from '@epub-counter/shared'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

function App() {
  // Verify shared types are accessible (test variables)
  const _testMetadata: EpubMetadata = {
    title: 'Test Book',
    author: 'Test Author',
  }
  const _testTokenizer: TokenizerType = 'gpt4'

  // Show types work via console (development debugging)
  console.log('Shared types test:', { _testMetadata, _testTokenizer })

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>EPUB Tokenizer Counter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Web UI for counting words and tokens in EPUB files
          </p>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
