# Real Images Implementation Plan

> **Document Type:** AI Coding Agent Execution Plan  
> **Version:** 1.0  
> **Created:** 2026-01-31  
> **Objective:** Remove demo-mode mocks for child photo uploads and Takealot product fetching, enabling real functionality in demo deployments.

---

## Executive Summary

This plan removes the demo-mode bypasses that return placeholder data for:
1. **Child photo uploads** — Currently returns a placeholder SVG instead of actually uploading
2. **Takealot product fetching** — Currently returns mock fixtures instead of scraping real product data

After implementation, demo mode will use the same real integrations as production, with actual images stored in Vercel Blob and real Takealot product data fetched and cached.

---

## Prerequisites

Before beginning implementation, verify these environment variables are configured in Vercel:

| Variable | Required | How to Obtain |
|----------|----------|---------------|
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Vercel Dashboard → Storage → Blob → Create Store |
| `KV_REST_API_URL` | Already set | Upstash Redis (for caching) |
| `KV_REST_API_TOKEN` | Already set | Upstash Redis (for caching) |

**CRITICAL:** The `BLOB_READ_WRITE_TOKEN` MUST be set before deployment, or child photo uploads will fail with a runtime error.

---

## Implementation Tasks

### Task 1: Remove Demo Bypass in Child Photo Upload

**File:** `src/lib/integrations/blob.ts`

**Current Code (lines 48-65):**
```typescript
export async function uploadChildPhoto(file: File, hostId: string) {
  if (file.size === 0) {
    throw new UploadChildPhotoError('empty_file', 'File is empty');
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    throw new UploadChildPhotoError('invalid_type', 'Invalid file type');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new UploadChildPhotoError('file_too_large', 'File is too large');
  }

  if (isDemoMode()) {
    return {
      url: DEMO_BLOB_PLACEHOLDER_URL,
      filename: `photos/${hostId}/demo-child.${extension}`,
    };
  }

  const filename = `photos/${hostId}/${Date.now()}.${extension}`;
  const { url } = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  });

  return { url, filename };
}
```

**Required Changes:**

1. **Remove the demo-mode bypass block entirely.** Delete lines:
   ```typescript
   if (isDemoMode()) {
     return {
       url: DEMO_BLOB_PLACEHOLDER_URL,
       filename: `photos/${hostId}/demo-child.${extension}`,
     };
   }
   ```

2. **Remove the unused import** for `DEMO_BLOB_PLACEHOLDER_URL` from the imports section:
   ```typescript
   // REMOVE THIS LINE:
   import { DEMO_BLOB_PLACEHOLDER_URL } from '@/lib/demo/fixtures';
   ```

3. **Keep the `isDemoMode` import** — it's still used elsewhere in the file (for `deleteChildPhoto` and `uploadPayoutReceipt`).

**Final Code for `uploadChildPhoto`:**
```typescript
export async function uploadChildPhoto(file: File, hostId: string) {
  if (file.size === 0) {
    throw new UploadChildPhotoError('empty_file', 'File is empty');
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    throw new UploadChildPhotoError('invalid_type', 'Invalid file type');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new UploadChildPhotoError('file_too_large', 'File is too large');
  }

  const filename = `photos/${hostId}/${Date.now()}.${extension}`;
  const { url } = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  });

  return { url, filename };
}
```

---

### Task 2: Remove Demo Bypass in Takealot Product Fetch

**File:** `src/lib/integrations/takealot.ts`

**Locate the `fetchTakealotProduct` function (approximately line 270).**

**Current Code:**
```typescript
export async function fetchTakealotProduct(rawUrl: string): Promise<TakealotProduct> {
  if (!isTakealotUrl(rawUrl)) {
    throw new Error('Invalid Takealot URL');
  }

  if (isDemoMode()) {
    return getDemoTakealotProduct(rawUrl);
  }

  const cacheKey = buildCacheKey('product', rawUrl);
  const cached = await kvAdapter.get<TakealotProduct>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(rawUrl, {
    headers: {
      'User-Agent': 'ChipIn/1.0 (+https://chipin.co.za)',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Takealot product');
  }

  const html = await response.text();
  const parsed = parseTakealotHtml(html, rawUrl);
  if (!parsed) {
    throw new Error('Could not extract product details');
  }

  await kvAdapter.set(cacheKey, parsed, { ex: TAKEALOT_CACHE_TTL_SECONDS });
  return parsed;
}
```

**Required Changes:**

1. **Remove the demo-mode bypass block.** Delete these lines:
   ```typescript
   if (isDemoMode()) {
     return getDemoTakealotProduct(rawUrl);
   }
   ```

**Final Code for `fetchTakealotProduct`:**
```typescript
export async function fetchTakealotProduct(rawUrl: string): Promise<TakealotProduct> {
  if (!isTakealotUrl(rawUrl)) {
    throw new Error('Invalid Takealot URL');
  }

  const cacheKey = buildCacheKey('product', rawUrl);
  const cached = await kvAdapter.get<TakealotProduct>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(rawUrl, {
    headers: {
      'User-Agent': 'ChipIn/1.0 (+https://chipin.co.za)',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Takealot product');
  }

  const html = await response.text();
  const parsed = parseTakealotHtml(html, rawUrl);
  if (!parsed) {
    throw new Error('Could not extract product details');
  }

  await kvAdapter.set(cacheKey, parsed, { ex: TAKEALOT_CACHE_TTL_SECONDS });
  return parsed;
}
```

---

### Task 3: Remove Demo Bypass in Takealot Search

**File:** `src/lib/integrations/takealot.ts`

**Locate the `fetchTakealotSearch` function (approximately line 250).**

**Current Code:**
```typescript
export async function fetchTakealotSearch(
  query: string,
  limit = 6
): Promise<TakealotSearchResult[]> {
  const normalizedQuery = query.trim();
  if (isDemoMode()) {
    return getDemoTakealotSearchResults(normalizedQuery, limit);
  }

  const cacheKey = buildCacheKey('search', normalizedQuery.toLowerCase());
  const cached = await kvAdapter.get<TakealotSearchResult[]>(cacheKey);
  if (cached) {
    return cached.slice(0, limit);
  }

  const searchUrl = `https://www.takealot.com/all?search=${encodeURIComponent(normalizedQuery)}`;
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'ChipIn/1.0 (+https://chipin.co.za)',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Takealot search results');
  }

  const html = await response.text();
  const results = parseTakealotSearchHtml(html);
  await kvAdapter.set(cacheKey, results, { ex: TAKEALOT_CACHE_TTL_SECONDS });
  return results.slice(0, limit);
}
```

**Required Changes:**

1. **Remove the demo-mode bypass block.** Delete these lines:
   ```typescript
   if (isDemoMode()) {
     return getDemoTakealotSearchResults(normalizedQuery, limit);
   }
   ```

**Final Code for `fetchTakealotSearch`:**
```typescript
export async function fetchTakealotSearch(
  query: string,
  limit = 6
): Promise<TakealotSearchResult[]> {
  const normalizedQuery = query.trim();

  const cacheKey = buildCacheKey('search', normalizedQuery.toLowerCase());
  const cached = await kvAdapter.get<TakealotSearchResult[]>(cacheKey);
  if (cached) {
    return cached.slice(0, limit);
  }

  const searchUrl = `https://www.takealot.com/all?search=${encodeURIComponent(normalizedQuery)}`;
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'ChipIn/1.0 (+https://chipin.co.za)',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Takealot search results');
  }

  const html = await response.text();
  const results = parseTakealotSearchHtml(html);
  await kvAdapter.set(cacheKey, results, { ex: TAKEALOT_CACHE_TTL_SECONDS });
  return results.slice(0, limit);
}
```

---

### Task 4: Clean Up Unused Imports in takealot.ts

**File:** `src/lib/integrations/takealot.ts`

After removing the demo bypasses, the following imports/functions may become unused:

1. **Check if `isDemoMode` is still used elsewhere in the file.** If not, remove:
   ```typescript
   import { isDemoMode } from '@/lib/demo';
   ```

2. **Check if `demoTakealotProducts` is still used.** If not, remove:
   ```typescript
   import { demoTakealotProducts } from '@/lib/demo/fixtures';
   ```

3. **Check if `getDemoTakealotProduct` function is still used.** If not, remove the entire function:
   ```typescript
   const getDemoTakealotProduct = (url: string): TakealotProduct => {
     // ... entire function body ...
   };
   ```

4. **Check if `getDemoTakealotSearchResults` function is still used.** If not, remove the entire function:
   ```typescript
   const getDemoTakealotSearchResults = (query: string, limit: number) => {
     // ... entire function body ...
   };
   ```

**Use your IDE or `pnpm lint` to identify unused imports/variables after making the changes.**

---

### Task 5: Clean Up Unused Exports in fixtures.ts

**File:** `src/lib/demo/fixtures.ts`

After the above changes, check if the following exports are still used anywhere in the codebase:

1. `DEMO_BLOB_PLACEHOLDER_URL` — May still be used in `uploadPayoutReceipt` 
2. `demoTakealotProducts` — Should no longer be needed

**Use grep or your IDE to search for usages:**
```bash
grep -r "DEMO_BLOB_PLACEHOLDER_URL" src/
grep -r "demoTakealotProducts" src/
```

**If `demoTakealotProducts` has no remaining usages, remove it from `fixtures.ts`.**

**DO NOT remove `DEMO_BLOB_PLACEHOLDER_URL` if it's still used in `uploadPayoutReceipt`.**

---

## Validation Steps

### Step 1: Type Check

Run TypeScript type checking to ensure no type errors:

```bash
pnpm typecheck
```

**Expected Result:** No errors. If errors occur, they likely indicate:
- Missing imports that were accidentally removed
- Type mismatches from incomplete edits

### Step 2: Lint Check

Run ESLint to catch unused imports and other issues:

```bash
pnpm lint
```

**Expected Result:** No errors. Warnings about unused variables indicate cleanup is needed.

### Step 3: Unit Tests

Run the test suite to ensure no regressions:

```bash
pnpm test
```

**Expected Result:** All tests pass. If Takealot-related tests fail, they may be testing mock behavior that no longer exists — update or remove those tests.

### Step 4: Build Verification

Ensure the production build succeeds:

```bash
pnpm build
```

**Expected Result:** Build completes without errors.

---

## Deployment Steps

### Step 1: Verify Environment Variables in Vercel

Before deploying, confirm in Vercel Dashboard → Settings → Environment Variables:

| Variable | Status |
|----------|--------|
| `BLOB_READ_WRITE_TOKEN` | Must be set |
| `KV_REST_API_URL` | Must be set |
| `KV_REST_API_TOKEN` | Must be set |
| `DEMO_MODE` | Should be `true` |
| `NEXT_PUBLIC_DEMO_MODE` | Should be `true` |

### Step 2: Commit and Push

```bash
git add -A
git status  # Review changes
git diff --cached  # Verify no sensitive data
git commit -m "feat: enable real image uploads and Takealot fetching in demo mode

- Remove demo bypass in uploadChildPhoto() - now uploads to Vercel Blob
- Remove demo bypass in fetchTakealotProduct() - now scrapes real data
- Remove demo bypass in fetchTakealotSearch() - now scrapes real results
- Clean up unused demo fixtures and imports

This enables demo deployments to use real product images and user-uploaded
child photos instead of placeholder data."

git push origin main
```

### Step 3: Monitor Deployment

1. Watch Vercel deployment logs for errors
2. Check that the build completes successfully
3. Verify the deployment URL is accessible

---

## Post-Deployment Testing

### Test 1: Child Photo Upload

1. Go to `https://chipin-mock.vercel.app/create`
2. Click "Enter Demo as Sarah"
3. On the Child Details page:
   - Enter a child name
   - Select a birthday date
   - **Upload a real photo** (JPG, PNG, or WebP, under 5MB)
4. Click "Continue to gift"
5. **Verify:** The photo should appear in subsequent steps (not a placeholder)

**If upload fails:**
- Check Vercel Function Logs for errors
- Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- Check that the token has write permissions

### Test 2: Takealot Product Fetch (URL)

1. Continue to the Gift Selection step
2. In the "Takealot product URL" field, paste a real Takealot URL, e.g.:
   ```
   https://www.takealot.com/lego-city-fire-station-60320/PLID71776109
   ```
3. Wait for the product to load
4. **Verify:** 
   - Product name matches the Takealot page
   - Product price matches
   - Product image loads (not a placeholder)

**If fetch fails:**
- Check browser console for errors
- Check Vercel Function Logs
- Try a different Takealot URL (some products may have unusual page structures)

### Test 3: Takealot Product Search

1. On the Gift Selection step, use the search box
2. Type a search term like "lego" or "bicycle"
3. Click "Search"
4. **Verify:**
   - Real Takealot products appear
   - Images load correctly
   - Prices are in ZAR

### Test 4: End-to-End Dream Board

1. Complete the entire dream board creation flow
2. View the dream board as a guest (use the share URL)
3. **Verify:**
   - Child photo displays correctly
   - Product image displays correctly
   - All information is accurate

---

## Rollback Plan

If critical issues arise after deployment:

### Option A: Revert the Commit

```bash
git revert HEAD
git push origin main
```

### Option B: Re-enable Demo Bypasses

If partial rollback is needed, re-add the demo mode checks:

```typescript
// In blob.ts uploadChildPhoto():
if (isDemoMode()) {
  return {
    url: DEMO_BLOB_PLACEHOLDER_URL,
    filename: `photos/${hostId}/demo-child.${extension}`,
  };
}

// In takealot.ts fetchTakealotProduct():
if (isDemoMode()) {
  return getDemoTakealotProduct(rawUrl);
}

// In takealot.ts fetchTakealotSearch():
if (isDemoMode()) {
  return getDemoTakealotSearchResults(normalizedQuery, limit);
}
```

---

## Known Limitations

### Takealot Scraping

1. **No official API** — Scraping is fragile and may break if Takealot changes their HTML structure
2. **Rate limiting** — Excessive requests may be blocked; caching mitigates this
3. **Legal considerations** — Acceptable for demo/internal use; production would need partnership

### Image Storage

1. **Vercel Blob free tier** — 1GB storage, 5GB bandwidth/month
2. **No automatic cleanup** — Demo images accumulate; may need periodic cleanup for long-term use

---

## Success Criteria

- [ ] Child photos upload successfully and display throughout the UI
- [ ] Real Takealot products can be fetched by URL
- [ ] Takealot search returns real products
- [ ] No placeholder images appear for user-created dream boards
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No runtime errors in Vercel logs

---

## Appendix: File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/integrations/blob.ts` | Modify | Remove demo bypass in `uploadChildPhoto()` |
| `src/lib/integrations/takealot.ts` | Modify | Remove demo bypasses in `fetchTakealotProduct()` and `fetchTakealotSearch()` |
| `src/lib/integrations/takealot.ts` | Delete | Remove `getDemoTakealotProduct()` function |
| `src/lib/integrations/takealot.ts` | Delete | Remove `getDemoTakealotSearchResults()` function |
| `src/lib/demo/fixtures.ts` | Modify | Remove unused `demoTakealotProducts` export (if no longer used) |

---

*End of Implementation Plan*
