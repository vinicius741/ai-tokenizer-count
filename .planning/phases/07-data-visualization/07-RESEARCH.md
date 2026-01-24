# Phase 07: Data Visualization & Comparison - Research

**Researched:** 2026-01-24
**Domain:** React Data Visualization (Recharts + TanStack Table)
**Confidence:** HIGH

## Summary

This research covers implementing interactive data visualization for the EPUB Tokenizer Counter web UI, including bar charts, scatter plots with trend lines, sortable/filterable results tables, and multi-tokenizer comparison heatmaps. The phase requires transforming raw results.json data into chart-ready formats, implementing responsive visualizations with Recharts, building a feature-rich data table with TanStack Table, and creating CSV export functionality.

**Key findings:**
- **Recharts 3.x** is the standard React charting library with built-in support for bar charts, scatter plots with linear regression (`lineType: 'fitting'`), responsive containers, and custom tooltips
- **TanStack Table v8** provides headless table logic for sorting, filtering, and complex data handling without imposing UI - pairs excellently with shadcn/ui Table components
- **react-papaparse** is the fastest in-browser CSV library for React, providing both reading and writing capabilities
- **Data transformation patterns** rely heavily on `Array.reduce()` and `Array.map()` for aggregating token counts by tokenizer and computing comparison percentages
- **Performance considerations**: Recharts handles 1000+ items with ResponsiveContainer, but large datasets may need memoization with `useMemo` for expensive transformations
- **shadcn/ui Card components** provide the layout structure for organizing visualizations with composable sub-components (CardHeader, CardTitle, CardContent)

**Primary recommendation:** Use Recharts for all chart visualizations (bar charts, scatter plots with trend lines), TanStack Table for the results data table with sorting/filtering, react-papaparse for CSV export, and organize everything within shadcn/ui Card components. Transform raw results.json data using memoized reducers, implement custom tooltips for rich metadata display, and use Recharts' ResponsiveContainer for responsive behavior.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Recharts** | 3.1.2+ | Chart library (bar, scatter) | Composable React components, built on SVG/D3, industry standard with 10M+ weekly downloads |
| **TanStack Table** | v8.x | Headless table logic | Sorting, filtering, pagination without UI constraints, excellent TypeScript support |
| **react-papaparse** | latest | CSV export/import | Fastest in-browser CSV parser for React, handles large files efficiently |
| **shadcn/ui** | latest | Layout & UI components | Card, Table, Button components already in project, consistent design system |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React hooks** | built-in | useMemo, useCallback | Memoize expensive data transformations and callback functions |
| **ResponsiveContainer** | (Recharts) | Responsive chart sizing | Auto-resize charts on window/container resize |
| **lucide-react** | (installed) | Icons for UI | Search, filter, download icons already available |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Recharts** | Chart.js, Nivo, Victory | Recharts has best React integration and TypeScript support; Chart.js requires wrapper; Niro less maintained |
| **TanStack Table** | React Table v7 (deprecated), AG Grid | TanStack v8 is current standard; AG Grid is enterprise (heavier); React Table v7 is deprecated |
| **react-papaparse** | PapaParse directly, csv-stringify | react-papaparse has React hooks and components; direct PapaParse requires more boilerplate |
| **Heatmap with custom div grid** | Recharts Heatmap, specialized heatmap libraries | Custom div grid gives full control for sequential color scale; heatmap libraries typically require diverging scales |

**Installation:**
```bash
# Already installed: React, TypeScript, Tailwind, shadcn/ui components
npm install recharts
npm install @tanstack/react-table
npm install react-papaparse

# react-papaparse requires peer dependencies
npm install papaparse @types/papaparse
```

## Architecture Patterns

### Recommended Component Structure

```
web/src/
├── components/
│   ├── visualization/
│   │   ├── BarChart.tsx              # Per-tokenizer bar charts
│   │   ├── ScatterChart.tsx          # Word vs token density with trend line
│   │   ├── ResultsTable.tsx          # Sortable/filterable data table
│   │   ├── ComparisonHeatmap.tsx     # Multi-tokenizer comparison grid
│   │   ├── ChartContainer.tsx        # Wrapper with Card + ResponsiveContainer
│   │   └── CustomTooltip.tsx         # Shared tooltip component
│   ├── hooks/
│   │   ├── useChartTransform.ts      # Transform results.json for charts
│   │   ├── useTableData.ts           # Transform and filter table data
│   │   └── useCSVExport.ts           # CSV export logic
│   └── lib/
│       ├── chart-utils.ts            # Color scales, formatters
│       └── data-transformers.ts      # Aggregation utilities
```

### Pattern 1: Data Transformation Pipeline

**What:** Transform raw `ResultsOutput` into chart-specific data structures using reduce/map patterns.

**When to use:** Preparing data for Recharts (expects `{name, value}` format) and TanStack Table (expects array of objects).

**Example:**
```typescript
// Transform for Recharts bar chart
interface ChartDataPoint {
  name: string;        // EPUB title
  value: number;       // Token count
  metadata: EpubResult; // Full data for tooltip
}

function transformToBarChartData(
  results: EpubResult[],
  tokenizerName: string
): ChartDataPoint[] {
  return results
    .filter(r => !r.error) // Only successful results
    .map(r => ({
      name: r.metadata.title,
      value: r.tokenCounts.find(t => t.name === tokenizerName)?.count || 0,
      metadata: r
    }));
}

// Aggregate for comparison heatmap
interface ComparisonData {
  epubTitle: string;
  tokenizers: Record<string, number>;
  lowestCount: number;
  percentages: Record<string, number>;
}

function transformToComparisonData(
  results: EpubResult[],
  tokenizerNames: string[]
): ComparisonData[] {
  return results
    .filter(r => !r.error)
    .map(r => {
      const counts = Object.fromEntries(
        tokenizerNames.map(name => [
          name,
          r.tokenCounts.find(t => t.name === name)?.count || 0
        ])
      );
      const lowestCount = Math.min(...Object.values(counts));

      return {
        epubTitle: r.metadata.title,
        tokenizers: counts,
        lowestCount,
        percentages: Object.fromEntries(
          Object.entries(counts).map(([name, count]) => [
            name,
            lowestCount > 0 ? (count / lowestCount) * 100 : 0
          ])
        )
      };
    });
}
```

### Pattern 2: Recharts Responsive Chart with Custom Tooltip

**What:** Wrap Recharts charts in ResponsiveContainer for automatic resizing and pass custom tooltip component.

**When to use:** All chart implementations to ensure responsiveness and rich tooltip content.

**Example:**
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip } from './CustomTooltip';

function TokenizerBarChart({ data, color }: { data: ChartDataPoint[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Custom tooltip showing rich metadata
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload.metadata;
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="font-semibold">{data.metadata.title}</p>
      <p className="text-sm text-muted-foreground">{data.metadata.author}</p>
      <p className="text-sm mt-2">Tokens: <strong>{payload[0].value.toLocaleString()}</strong></p>
      <p className="text-sm">Words: {data.wordCount.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mt-1">{data.filePath}</p>
    </div>
  );
}
```

### Pattern 3: Scatter Plot with Linear Regression Trend Line

**What:** Use Recharts ScatterChart with built-in trend line using `lineType: 'fitting'`.

**When to use:** Visualizing word count vs token count density with trend line.

**Example:**
```typescript
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ScatterPoint {
  x: number; // Word count
  y: number; // Token count
  z: string; // Tokenizer name
  metadata: EpubResult;
}

function TokenDensityScatter({ data }: { data: ScatterPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis
          dataKey="x"
          name="Words"
          label={{ value: 'Word Count', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          dataKey="y"
          name="Tokens"
          label={{ value: 'Token Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {Object.entries(groupBy(data, 'z')).map(([tokenizer, points], index) => (
          <Scatter
            key={tokenizer}
            name={tokenizer}
            data={points}
            fill={TOKENIZER_COLORS[tokenizer]}
            line={{ stroke: TOKENIZER_COLORS[tokenizer], strokeWidth: 2 }}
            lineType="fitting" // Enables linear regression trend line
            shape="circle"
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 4: TanStack Table with Sorting and Filtering

**What:** Use `useReactTable` hook with `getSortedRowModel` and `getFilteredRowModel` for client-side operations.

**When to use:** Results table requiring sortable columns and text search filtering.

**Example:**
```typescript
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<EpubResult>();

const columns = [
  columnHelper.accessor('metadata.title', {
    header: 'Title',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('metadata.author', {
    header: 'Author',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('wordCount', {
    header: 'Words',
    cell: info => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor(row => row.tokenCounts[0]?.count || 0, {
    id: 'tokenCount',
    header: 'Tokens',
    cell: info => info.getValue().toLocaleString(),
  }),
];

function ResultsTable({ data }: { data: EpubResult[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'tokenCount', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Collapsible search input */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-4 w-4" />
        </Button>
        {showSearch && (
          <Input
            placeholder="Search title or author..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="mt-2"
          />
        )}
      </div>

      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer px-4 py-3 text-left"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ↑'}
                  {header.column.getIsSorted() === 'desc' && ' ↓'}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pattern 5: Comparison Heatmap with Sequential Color Scale

**What:** Custom grid layout with colored cells based on percentage difference from lowest token count.

**When to use:** Multi-tokenizer comparison view showing relative differences.

**Example:**
```typescript
function ComparisonHeatmap({ data, tokenizers }: ComparisonDataProps) {
  // Sequential color scale: light green (100%) to dark green (150%+)
  const getColorForPercentage = (percentage: number) => {
    if (percentage < 105) return 'bg-green-100';
    if (percentage < 115) return 'bg-green-200';
    if (percentage < 125) return 'bg-green-300';
    if (percentage < 140) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left">EPUB</th>
            {tokenizers.map(t => (
              <th key={t} className="p-3 text-center min-w-[100px]">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.epubTitle} className="border-t">
              <td className="p-3 font-medium">{row.epubTitle}</td>
              {tokenizers.map(tokenizer => {
                const percentage = row.percentages[tokenizer];
                return (
                  <td key={tokenizer} className="p-3 text-center">
                    <div
                      className={cn(
                        "rounded px-3 py-2 text-sm font-medium",
                        getColorForPercentage(percentage)
                      )}
                      title={`${row.tokenizers[tokenizer].toLocaleString()} tokens`}
                    >
                      {percentage.toFixed(1)}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Inline data transformation in render**: Always memoize expensive transformations with `useMemo` to prevent recalculation on every render
- **Hardcoded colors**: Use a centralized color palette object for tokenizer-specific colors
- **Direct DOM manipulation for responsiveness**: Always use Recharts' ResponsiveContainer instead of manual resize listeners
- **Unoptimized re-renders**: Use React.memo for chart components and useMemo for data transformations
- **Missing error handling**: Filter out failed EPUB results (where `error` property exists) before visualization

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering from scratch | Custom SVG components | Recharts | Axes, tooltips, responsive behavior, trend lines - massive complexity |
| Table sorting/filtering | Manual array sorting + filter state | TanStack Table | Multi-column sort, sort indicators, filter state management |
| CSV generation | Manual string concatenation | react-papaparse | Handles escaping, quotes, special characters, large files |
| Linear regression calculation | Custom math functions | Recharts `lineType: 'fitting'` | Built-in trend line calculation for scatter plots |
| Color scale generation | Manual if/else chains | Tailwind color classes with utility function | Consistent colors, easier adjustments |
| Responsive chart sizing | Resize observers + width/height state | Recharts ResponsiveContainer | Handles all edge cases, debounce, container queries |

**Key insight:** Visualization libraries have solved dozens of edge cases (empty data, extreme values, responsive behavior, accessibility). Custom implementations inevitably miss these.

## Common Pitfalls

### Pitfall 1: Missing Error Filtering in Data Transformation

**What goes wrong:** Failed EPUB results have `tokenCounts` with `-1` values, which break visualizations (negative bars, distorted scatter plots).

**Why it happens:** Raw results.json includes both successful and failed EPUBs; transformation code doesn't filter.

**How to avoid:** Always filter `results.filter(r => !r.error && r.tokenCounts.every(t => t.count >= 0))` before transforming.

**Warning signs:** Charts show negative values, tooltips display "-1 tokens", scatter plot points cluster at origin.

### Pitfall 2: Re-rendering Expensive Transformations

**What goes wrong:** Every state change triggers full data transformation, causing lag with 1000+ EPUBs.

**Why it happens:** Data transformation happens in component body without memoization.

**How to avoid:** Wrap transformations in `useMemo` with proper dependencies:
```typescript
const chartData = useMemo(
  () => transformToBarChartData(results, tokenizerName),
  [results, tokenizerName]
);
```

**Warning signs:** UI freezes briefly when toggling filters or sorting, React DevTools Profiler shows long "render" times.

### Pitfall 3: X-Axis Label Overlap on Bar Charts

**What goes wrong:** Long EPUB titles overlap and become unreadable on bar chart x-axis.

**Why it happens:** Default horizontal x-axis doesn't accommodate many items with long labels.

**How to avoid:** Use angled labels with `angle={-45}` and increased height:
```typescript
<XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
  interval={0}
/>
```

**Warning signs:** Labels run into each other, can't read EPUB names.

### Pitfall 4: Missing ResponsiveContainer Aspect Ratio

**What goes wrong:** Charts collapse to zero height or don't resize properly in flex containers.

**Why it happens:** Recharts needs explicit dimensions or ResponsiveContainer wrapper.

**How to avoid:** Always wrap charts in ResponsiveContainer:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart ... />
</ResponsiveContainer>
```

**Warning signs:** Chart disappears when window resizes, height is 0px in DevTools.

### Pitfall 5: CSV Export Breaking on Special Characters

**What goes wrong:** EPUB titles with quotes, commas, or newlines break CSV format.

**Why it happens:** Manual CSV construction doesn't properly escape special characters.

**How to avoid:** Use react-papaparse which handles RFC 4180 CSV escaping automatically.

**Warning signs:** CSV files won't open in Excel, rows are misaligned, special characters appear garbled.

### Pitfall 6: Incorrect Token Count Access in Table

**What goes wrong:** Table shows "0" for all token counts or crashes on undefined.

**Why it happens:** `tokenCounts` is an array, not an object - need to find by name.

**How to avoid:** Use helper function to safely access token count:
```typescript
const getTokenCount = (result: EpubResult, tokenizerName: string) => {
  return result.tokenCounts.find(t => t.name === tokenizerName)?.count || 0;
};
```

**Warning signs:** Table column always shows 0 or undefined, console errors about `.find()`.

## Code Examples

Verified patterns from official sources:

### Bar Chart with Sorting Toggle

```typescript
// Source: Recharts documentation + React state patterns
function SortableBarChart({ data, color }: { data: ChartDataPoint[]; color: string }) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(
    () => [...data].sort((a, b) =>
      sortOrder === 'asc' ? a.value - b.value : b.value - a.value
    ),
    [data, sortOrder]
  );

  return (
    <div className="space-y-4">
      <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        Sort {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### CSV Export with react-papaparse

```typescript
// Source: react-papaparse documentation
import { useCSVDownloader } from 'react-papaparse';

function ExportToCSV({ results, tokenizers }: { results: EpubResult[]; tokenizers: string[] }) {
  const { CSVDownloader, Type } = useCSVDownloader();

  const csvData = useMemo(
    () => results
      .filter(r => !r.error)
      .map(r => ({
        title: r.metadata.title,
        author: r.metadata.author,
        wordCount: r.wordCount,
        ...Object.fromEntries(
          tokenizers.map(t => [
            `${t} tokens`,
            r.tokenCounts.find(tc => tc.name === t)?.count || 0
          ])
        )
      })),
    [results, tokenizers]
  );

  return (
    <CSVDownloader
      filename={`epub-tokens-${new Date().toISOString().split('T')[0]}.csv`}
      data={csvData}
      type={Type.Button}
    >
      Export to CSV
    </CSVDownloader>
  );
}
```

### Tokenizer Color Palette

```typescript
// Source: shadcn/ui color system + HSL color scale
export const TOKENIZER_COLORS: Record<string, string> = {
  gpt4: 'hsl(221, 83%, 53%)',      // Blue
  claude: 'hsl(25, 95%, 53%)',     // Orange
  'hf:bert-base-uncased': 'hsl(142, 71%, 45%)', // Green
  'hf:gpt2': 'hsl(280, 65%, 60%)', // Purple
  // Fallback for unknown tokenizers
  default: 'hsl(215, 25%, 27%)'
};

function getTokenizerColor(tokenizerName: string): string {
  return TOKENIZER_COLORS[tokenizerName] || TOKENIZER_COLORS.default;
}
```

### Memoized Data Transformation Hook

```typescript
// Source: React hooks documentation + data transformation patterns
function useChartTransform(results: EpubResult[], tokenizerName: string) {
  return useMemo(() => {
    const validResults = results.filter(r => !r.error);

    return {
      barChartData: validResults.map(r => ({
        name: r.metadata.title,
        value: r.tokenCounts.find(t => t.name === tokenizerName)?.count || 0,
        metadata: r
      })),
      scatterData: validResults.map(r => ({
        x: r.wordCount,
        y: r.tokenCounts.find(t => t.name === tokenizerName)?.count || 0,
        z: tokenizerName,
        metadata: r
      })),
      summary: {
        total: validResults.length,
        avgTokens: validResults.reduce((sum, r) =>
          sum + (r.tokenCounts.find(t => t.name === tokenizerName)?.count || 0), 0
        ) / validResults.length
      }
    };
  }, [results, tokenizerName]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual SVG chart construction | Recharts composable components | 2016+ | Declarative charts, less boilerplate, built-in responsiveness |
| React Table v7 (hooks-based) | TanStack Table v8 (framework agnostic) | 2022 | Better TypeScript support, headless architecture |
| Manual CSV string building | react-papaparse | 2018+ | RFC 4180 compliance, handles edge cases |
| ResizeObserver for responsive charts | Recharts ResponsiveContainer | 2017+ | Automatic handling, no manual resize logic |
| Inline data transformations | useMemo for expensive computations | React 18+ | Performance optimization, fewer re-renders |

**Deprecated/outdated:**
- React Table v7: Renamed to TanStack Table, use v8 for new projects
- Chart.js direct usage: Prefer React-specific wrappers like Recharts for better integration
- Manual trend line calculation: Recharts built-in `lineType: 'fitting'` handles linear regression
- Custom sorting/filtering logic: TanStack Table provides production-ready implementations

## Open Questions

Things that couldn't be fully resolved:

1. **Recharts performance with 1000+ EPUB dataset**
   - What we know: Recharts is designed for common use cases and handles large datasets, but GitHub issues report performance degradation with 3MB+ data
   - What's unclear: Exact threshold where performance degrades for our specific use case (bar charts with ~1000 bars)
   - Recommendation: Implement with basic Recharts setup first, then add data sampling if needed (show top 100 EPUBs by token count, add "Show all" toggle)

2. **Optimal color scale for heatmap percentages**
   - What we know: Sequential green scale (light to dark) for 100%+ range
   - What's unclear: Exact percentage thresholds for each color bin
   - Recommendation: Start with 5 bins: 100-105%, 105-115%, 115-125%, 125-140%, 140%+, adjust based on real data distribution

3. **Tooltip performance on hover with large datasets**
   - What we know: Custom tooltips can trigger re-renders
   - What's unclear: Whether custom tooltip content causes lag with 1000+ data points
   - Recommendation: Use React.memo for CustomTooltip component, test with real dataset, consider simplifying tooltip content if performance issues

## Sources

### Primary (HIGH confidence)
- [Recharts Official Documentation](https://recharts.org/) - Core library API, components, and examples
- [Recharts npm package](https://www.npmjs.com/package/recharts) - v3.1.2, published 8 days ago, 10M+ weekly downloads
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/) - Official performance optimization documentation
- [Recharts ScatterChart API](https://recharts.github.io/en-US/api/Scatter/) - Scatter chart with `lineType: 'fitting'` for trend lines
- [TanStack Table Sorting Guide](https://tanstack.com/table/latest/docs/guide/sorting) - Comprehensive sorting documentation
- [shadcn/ui Table Documentation](https://ui.shadcn.com/docs/components/table) - Official table component docs with TanStack integration
- [shadcn/ui Card Documentation](https://ui.shadcn.com/docs/components/card) - Card composition patterns (CardHeader, CardContent)

### Secondary (MEDIUM confidence)
- [TanStack Table Official Site](https://tanstack.com/table) - Library overview and features
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - Comparative analysis from LogRocket (April 2025)
- [Top 5 React Chart Libraries 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) - Current state of chart libraries (January 2026)
- [Object.groupBy vs Array.reduce](https://blog.logrocket.com/guide-object-groupby-alternative-array-reduce/) - Modern data grouping patterns (February 2025)
- [Best heatmap libraries for React](https://blog.logrocket.com/best-heatmap-libraries-react/) - Heatmap library comparison
- [Working with CSV files with react-papaparse](https://blog.logrocket.com/working-csv-files-react-papaparse/) - CSV library usage guide
- [Recharts ResponsiveContainer Guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer) - Responsive chart implementation

### Tertiary (LOW confidence)
- [Recharts GitHub Issue #1146](https://github.com/recharts/recharts/issues/1146) - Large data performance discussion
- [Recharts trend line CodeSandbox](https://codesandbox.io/s/recharts-trendline-vkx1j2) - Working trendline example
- [Stack Overflow: Tooltip sorting](https://stackoverflow.com/questions/72597055/recharts-how-to-sort-order-of-elements-in-tooltip) - Tooltip customization patterns
- [Reddit: useMemo and useCallback best practices](https://www.reddit.com/r/reactjs/comments/17ob3ve/best_practice_for_memo_usememo_and_usecallback/) - Community optimization patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts and TanStack Table are industry standards with excellent documentation and active maintenance
- Architecture: HIGH - Patterns verified against official documentation and established React best practices
- Pitfalls: MEDIUM - Based on common issues documented in GitHub repositories and StackOverflow, but some specific to our data structure

**Research date:** 2026-01-24
**Valid until:** 2026-02-23 (30 days - stable library ecosystem, but Recharts v4 may release)
