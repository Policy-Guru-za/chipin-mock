# Takealot URL Fetch UX Implementation Plan

> **Document Type:** AI Coding Agent Execution Plan  
> **Version:** 1.0  
> **Created:** 2026-01-31  
> **Objective:** Simplify the Takealot gift selection UX by removing keyword search and implementing instant URL-based product fetching with preview.

---

## Executive Summary

**Current UX:**
1. User can search Takealot by keyword (results displayed)
2. User can paste a URL in a separate input
3. User selects overflow charity
4. User clicks "Continue" — product is fetched on form submission
5. If fetch fails, user sees error and must retry

**New UX:**
1. User pastes Takealot URL
2. User clicks "Fetch Product" — product is fetched immediately
3. Product preview displays (image, name, price)
4. User selects overflow charity
5. User clicks "Continue" — proceeds with already-fetched data

**Benefits:**
- Simpler interface (one input instead of two)
- Immediate feedback on URL validity
- User sees product before committing
- Reduced form submission errors

---

## Technical Context

### Existing Infrastructure

| Component | Location | Purpose |
|-----------|----------|---------|
| Fetch API endpoint | `/api/internal/products/fetch` | POST with `{url}` → returns product data |
| Form component | `src/components/forms/TakealotGiftForm.tsx` | Client component with search + URL input |
| Page component | `src/app/(host)/create/gift/page.tsx` | Server component, handles form submission |
| Takealot fetcher | `src/lib/integrations/takealot.ts` | `fetchTakealotProduct(url)` function |

### API Response Format

```typescript
// POST /api/internal/products/fetch
// Request: { url: string }
// Response:
{
  data: {
    id: string | null;
    name: string;
    price_cents: number;
    image_url: string;
    product_url: string;
    in_stock: boolean;
  }
}
```

---

## Implementation Tasks

### Task 1: Refactor TakealotGiftForm Component

**File:** `src/components/forms/TakealotGiftForm.tsx`

**Changes Required:**

1. **Remove SearchSection component entirely** (lines ~53-98)

2. **Remove search-related state variables:**
   ```typescript
   // REMOVE these:
   const [query, setQuery] = useState('');
   const [results, setResults] = useState<TakealotProduct[]>([]);
   const [searchError, setSearchError] = useState<string | null>(null);
   ```

3. **Add new state for fetched product:**
   ```typescript
   const [fetchedProduct, setFetchedProduct] = useState<TakealotProduct | null>(null);
   const [fetchError, setFetchError] = useState<string | null>(null);
   const [fetching, setFetching] = useState(false);
   ```

4. **Add URL fetch handler:**
   ```typescript
   const handleFetchProduct = async () => {
     setFetchError(null);
     setFetchedProduct(null);

     const trimmedUrl = productUrl.trim();
     if (!trimmedUrl) {
       setFetchError('Please enter a Takealot URL.');
       return;
     }

     // Basic URL validation
     if (!trimmedUrl.includes('takealot.com')) {
       setFetchError('Please enter a valid Takealot URL.');
       return;
     }

     setFetching(true);

     try {
       const response = await fetch('/api/internal/products/fetch', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ url: trimmedUrl }),
       });

       if (!response.ok) {
         const payload = await response.json().catch(() => null);
         setFetchError(payload?.error ?? 'Could not fetch product. Please check the URL.');
         return;
       }

       const payload = await response.json();
       if (!payload?.data) {
         setFetchError('Could not fetch product details.');
         return;
       }

       setFetchedProduct({
         url: payload.data.product_url,
         name: payload.data.name,
         priceCents: payload.data.price_cents,
         imageUrl: payload.data.image_url,
       });
     } catch {
       setFetchError('Failed to fetch product. Please try again.');
     } finally {
       setFetching(false);
     }
   };
   ```

5. **Create ProductPreview component:**
   ```typescript
   type ProductPreviewProps = {
     product: TakealotProduct;
     onClear: () => void;
   };

   const ProductPreview = ({ product, onClear }: ProductPreviewProps) => (
     <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
       <Image
         src={product.imageUrl}
         alt={product.name}
         width={80}
         height={80}
         className="h-20 w-20 rounded-xl object-cover"
       />
       <div className="flex-1 space-y-1">
         <p className="text-sm font-semibold text-text">{product.name}</p>
         <p className="text-sm text-text-muted">
           R{(product.priceCents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
         </p>
       </div>
       <Button type="button" variant="ghost" size="sm" onClick={onClear}>
         Change
       </Button>
     </div>
   );
   ```

6. **Create URLInputSection component:**
   ```typescript
   type URLInputSectionProps = {
     productUrl: string;
     onUrlChange: (value: string) => void;
     onFetch: () => void;
     fetching: boolean;
     error: string | null;
   };

   const URLInputSection = ({
     productUrl,
     onUrlChange,
     onFetch,
     fetching,
     error,
   }: URLInputSectionProps) => (
     <div className="space-y-3">
       <div className="space-y-2">
         <label htmlFor="productUrl" className="text-sm font-medium text-text">
           Takealot product URL
         </label>
         <div className="flex flex-wrap gap-3">
           <Input
             id="productUrl"
             value={productUrl}
             onChange={(event) => onUrlChange(event.target.value)}
             onKeyDown={(event) => {
               if (event.key === 'Enter') {
                 event.preventDefault();
                 onFetch();
               }
             }}
             placeholder="https://www.takealot.com/product-name/PLID12345678"
             className="flex-1"
           />
           <Button type="button" variant="outline" disabled={fetching} onClick={onFetch}>
             {fetching ? 'Fetching…' : 'Fetch Product'}
           </Button>
         </div>
       </div>
       {error ? <p className="text-sm text-red-600">{error}</p> : null}
     </div>
   );
   ```

7. **Update the main form render:**
   ```typescript
   return (
     <form action={action} className="space-y-6">
       {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

       {fetchedProduct ? (
         <ProductPreview
           product={fetchedProduct}
           onClear={() => {
             setFetchedProduct(null);
             setProductUrl('');
           }}
         />
       ) : (
         <URLInputSection
           productUrl={productUrl}
           onUrlChange={setProductUrl}
           onFetch={handleFetchProduct}
           fetching={fetching}
           error={fetchError}
         />
       )}

       {/* Hidden input to pass the validated URL to the form action */}
       <input type="hidden" name="productUrl" value={fetchedProduct?.url ?? productUrl} />

       <OverflowSelection causes={causes} selectedOverflow={selectedOverflow} />

       <Button type="submit" disabled={!fetchedProduct}>
         Continue to payout details
       </Button>
     </form>
   );
   ```

---

### Task 2: Update Form Props Interface

**File:** `src/components/forms/TakealotGiftForm.tsx`

**Remove unused props:**
```typescript
// OLD:
type TakealotGiftFormProps = {
  action: (formData: FormData) => void;
  causes: Cause[];
  defaultProductUrl: string;
  selectedOverflow?: string;
  error?: string;
};

// NEW (same, but defaultProductUrl behavior changes):
type TakealotGiftFormProps = {
  action: (formData: FormData) => void;
  causes: Cause[];
  defaultProductUrl: string;
  defaultProduct?: TakealotProduct | null; // NEW: pre-fetched product from draft
  selectedOverflow?: string;
  error?: string;
};
```

**Initialize state from defaultProduct:**
```typescript
const [fetchedProduct, setFetchedProduct] = useState<TakealotProduct | null>(
  defaultProduct ?? null
);
```

---

### Task 3: Update Gift Page to Pass Default Product

**File:** `src/app/(host)/create/gift/page.tsx`

**In TakealotGiftSection, pass the existing product from draft:**
```typescript
<TakealotGiftForm
  action={saveTakealotGiftAction}
  causes={CURATED_CAUSES}
  defaultProductUrl={
    draft.giftData?.type === 'takealot_product' ? draft.giftData.productUrl : ''
  }
  defaultProduct={
    draft.giftData?.type === 'takealot_product'
      ? {
          url: draft.giftData.productUrl,
          name: draft.giftData.productName,
          priceCents: draft.giftData.productPrice,
          imageUrl: draft.giftData.productImage,
        }
      : null
  }
  selectedOverflow={selectedOverflow}
  error={error}
/>
```

**Remove the duplicate product preview below the form** (since it's now inside the form):
```typescript
// REMOVE this block from TakealotGiftSection:
{draft.giftData?.type === 'takealot_product' && view.giftPreview ? (
  <div className="flex items-center gap-4 rounded-2xl border border-border bg-subtle p-4">
    ...
  </div>
) : null}
```

---

### Task 4: Update Card Description

**File:** `src/app/(host)/create/gift/page.tsx`

**Change the CardDescription text:**
```typescript
// OLD:
<CardDescription>
  Search or paste a Takealot link and select a charity overflow.
</CardDescription>

// NEW:
<CardDescription>
  Paste a Takealot product link and select a charity overflow.
</CardDescription>
```

---

### Task 5: Handle Edge Cases

**File:** `src/components/forms/TakealotGiftForm.tsx`

1. **Clear fetch error when URL changes:**
   ```typescript
   const handleUrlChange = (value: string) => {
     setProductUrl(value);
     setFetchError(null);
   };
   ```

2. **Disable submit button appropriately:**
   ```typescript
   <Button type="submit" disabled={!fetchedProduct || fetching}>
     Continue to payout details
   </Button>
   ```

3. **Handle out-of-stock products:**
   ```typescript
   // In ProductPreview, add stock status:
   {!product.inStock ? (
     <p className="text-xs text-amber-600">⚠ This product may be out of stock</p>
   ) : null}
   ```

---

## Complete Refactored Component

**File:** `src/components/forms/TakealotGiftForm.tsx`

```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CauseImpact = {
  amountCents: number;
  description: string;
};

type Cause = {
  id: string;
  name: string;
  impacts: CauseImpact[];
};

type TakealotProduct = {
  url: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  inStock?: boolean;
};

type TakealotGiftFormProps = {
  action: (formData: FormData) => void;
  causes: Cause[];
  defaultProductUrl: string;
  defaultProduct?: TakealotProduct | null;
  selectedOverflow?: string;
  error?: string;
};

const getTakealotErrorMessage = (error?: string) => {
  if (!error) return null;
  if (error === 'overflow') return 'Please choose a charity overflow option.';
  if (error === 'fetch_failed') return 'We could not fetch that product. Please try another link.';
  return 'Please enter a valid Takealot link.';
};

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {message}
  </div>
);

type ProductPreviewProps = {
  product: TakealotProduct;
  onClear: () => void;
};

const ProductPreview = ({ product, onClear }: ProductPreviewProps) => (
  <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={80}
      height={80}
      className="h-20 w-20 rounded-xl object-cover"
    />
    <div className="flex-1 space-y-1">
      <p className="text-sm font-semibold text-text">{product.name}</p>
      <p className="text-sm text-text-muted">
        R{(product.priceCents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
      </p>
      {product.inStock === false ? (
        <p className="text-xs text-amber-600">⚠ This product may be out of stock</p>
      ) : null}
    </div>
    <Button type="button" variant="ghost" size="sm" onClick={onClear}>
      Change
    </Button>
  </div>
);

type URLInputSectionProps = {
  productUrl: string;
  onUrlChange: (value: string) => void;
  onFetch: () => void;
  fetching: boolean;
  error: string | null;
};

const URLInputSection = ({
  productUrl,
  onUrlChange,
  onFetch,
  fetching,
  error,
}: URLInputSectionProps) => (
  <div className="space-y-3">
    <div className="space-y-2">
      <label htmlFor="productUrl" className="text-sm font-medium text-text">
        Takealot product URL
      </label>
      <div className="flex flex-wrap gap-3">
        <Input
          id="productUrl"
          value={productUrl}
          onChange={(event) => onUrlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onFetch();
            }
          }}
          placeholder="https://www.takealot.com/product-name/PLID12345678"
          className="flex-1"
        />
        <Button type="button" variant="outline" disabled={fetching} onClick={onFetch}>
          {fetching ? 'Fetching…' : 'Fetch Product'}
        </Button>
      </div>
    </div>
    {error ? <p className="text-sm text-red-600">{error}</p> : null}
  </div>
);

type OverflowSelectionProps = {
  causes: Cause[];
  selectedOverflow?: string;
};

const OverflowSelection = ({ causes, selectedOverflow }: OverflowSelectionProps) => (
  <div className="space-y-3">
    <p className="text-sm font-semibold text-text">
      If the gift is fully funded early, which charity should we support?
    </p>
    <div className="grid gap-3">
      {causes.map((cause) =>
        cause.impacts.map((impact, index) => {
          const value = `${cause.id}::${index}`;
          return (
            <label
              key={value}
              className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4"
            >
              <input
                type="radio"
                name="overflowSelection"
                value={value}
                defaultChecked={selectedOverflow === value}
                className="mt-1"
                required
              />
              <div>
                <p className="text-sm font-semibold text-text">{cause.name}</p>
                <p className="text-xs text-text-muted">{impact.description}</p>
              </div>
            </label>
          );
        })
      )}
    </div>
  </div>
);

export function TakealotGiftForm({
  action,
  causes,
  defaultProductUrl,
  defaultProduct,
  selectedOverflow,
  error,
}: TakealotGiftFormProps) {
  const [productUrl, setProductUrl] = useState(defaultProductUrl);
  const [fetchedProduct, setFetchedProduct] = useState<TakealotProduct | null>(
    defaultProduct ?? null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const errorMessage = getTakealotErrorMessage(error);

  const handleUrlChange = (value: string) => {
    setProductUrl(value);
    setFetchError(null);
  };

  const handleFetchProduct = async () => {
    setFetchError(null);
    setFetchedProduct(null);

    const trimmedUrl = productUrl.trim();
    if (!trimmedUrl) {
      setFetchError('Please enter a Takealot URL.');
      return;
    }

    if (!trimmedUrl.includes('takealot.com')) {
      setFetchError('Please enter a valid Takealot URL.');
      return;
    }

    setFetching(true);

    try {
      const response = await fetch('/api/internal/products/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setFetchError(payload?.error ?? 'Could not fetch product. Please check the URL.');
        return;
      }

      const payload = await response.json();
      if (!payload?.data) {
        setFetchError('Could not fetch product details.');
        return;
      }

      setFetchedProduct({
        url: payload.data.product_url,
        name: payload.data.name,
        priceCents: payload.data.price_cents,
        imageUrl: payload.data.image_url,
        inStock: payload.data.in_stock,
      });
    } catch {
      setFetchError('Failed to fetch product. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleClearProduct = () => {
    setFetchedProduct(null);
    setProductUrl('');
  };

  return (
    <form action={action} className="space-y-6">
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      {fetchedProduct ? (
        <ProductPreview product={fetchedProduct} onClear={handleClearProduct} />
      ) : (
        <URLInputSection
          productUrl={productUrl}
          onUrlChange={handleUrlChange}
          onFetch={handleFetchProduct}
          fetching={fetching}
          error={fetchError}
        />
      )}

      <input type="hidden" name="productUrl" value={fetchedProduct?.url ?? productUrl} />

      <OverflowSelection causes={causes} selectedOverflow={selectedOverflow} />

      <Button type="submit" disabled={!fetchedProduct || fetching}>
        Continue to payout details
      </Button>
    </form>
  );
}
```

---

## Validation Steps

### Step 1: Type Check

```bash
pnpm typecheck
```

**Expected:** No errors.

### Step 2: Lint

```bash
pnpm lint
```

**Expected:** No errors. Fix any unused import warnings.

### Step 3: Build

```bash
pnpm build
```

**Expected:** Build succeeds.

### Step 4: Unit Tests

```bash
pnpm test
```

**Expected:** All tests pass. If there are tests for the old search functionality, update or remove them.

---

## Post-Deployment Testing

### Test 1: Basic URL Fetch

1. Navigate to `/create/gift?type=takealot`
2. Paste a valid Takealot URL, e.g.:
   ```
   https://www.takealot.com/lego-city-fire-station-60320/PLID71776109
   ```
3. Click "Fetch Product"
4. **Verify:**
   - Loading state shows "Fetching…"
   - Product preview appears with image, name, price
   - "Continue" button becomes enabled

### Test 2: Invalid URL Handling

1. Paste an invalid URL (e.g., `https://google.com`)
2. Click "Fetch Product"
3. **Verify:** Error message "Please enter a valid Takealot URL."

### Test 3: Network Error Handling

1. Disconnect internet or use invalid Takealot URL
2. Click "Fetch Product"
3. **Verify:** Appropriate error message displays

### Test 4: Product Change Flow

1. Fetch a product successfully
2. Click "Change" button
3. **Verify:** 
   - Product preview disappears
   - URL input reappears (empty)
   - User can paste a new URL

### Test 5: Form Submission

1. Fetch a product
2. Select an overflow charity
3. Click "Continue to payout details"
4. **Verify:** Navigates to `/create/details` with product data saved

### Test 6: Draft Persistence

1. Complete gift selection
2. Navigate back to `/create/gift`
3. **Verify:** Previously fetched product displays as preview

---

## Rollback Plan

If issues arise, revert to the previous component:

```bash
git revert HEAD
git push origin main
```

---

## Success Criteria

- [ ] Search input and functionality removed
- [ ] URL input with "Fetch Product" button works
- [ ] Product preview displays after successful fetch
- [ ] "Change" button allows selecting a different product
- [ ] Form submission disabled until product is fetched
- [ ] Error states handled gracefully
- [ ] Draft persistence works correctly
- [ ] All tests pass
- [ ] Build succeeds

---

*End of Implementation Plan*
