import { parseEpub } from '@gxl/epub-parser';

async function debugParse() {
  try {
    const epubObj = await parseEpub('/Users/ilia/Documents/ai-tokenizer-count/epubs/test-book-1.epub', { type: 'path' });
    
    console.log('=== PARSE RESULT ===');
    console.log('Sections:', epubObj.sections?.length || 0);
    console.log('Info structure:', JSON.stringify(epubObj.info, null, 2));
    
    if (epubObj.sections && epubObj.sections.length > 0) {
      console.log('\n=== FIRST SECTION ===');
      console.log('Section keys:', Object.keys(epubObj.sections[0]));
      console.log('Has toMarkdown:', typeof epubObj.sections[0].toMarkdown);
      
      if (typeof epubObj.sections[0].toMarkdown === 'function') {
        const md = epubObj.sections[0].toMarkdown();
        console.log('Markdown result type:', typeof md);
        console.log('Markdown result:', md);
        console.log('Has textContent:', md?.textContent);
      }
    }
  } catch (error) {
    console.error('Parse error:', error);
  }
}

debugParse();
