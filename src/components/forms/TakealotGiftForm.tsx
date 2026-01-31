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
        <p className="text-xs text-amber-600">This product may be out of stock</p>
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
