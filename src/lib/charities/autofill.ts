import {
  CharityDraftGenerationError,
  generateCharityDraftWithClaude,
  type CharityCategory,
  type CharityDraft,
} from './claude';
import { maybeMirrorCharityLogoToBlob } from './logo';
import {
  CharityUrlIngestError,
  ingestCharityWebsite,
  normalizeCharityUrlInput,
  type CharitySourcePage,
} from './url-ingest';

export type UrlAutofillWarning = { code: string; message: string };

export type AutofillCharityDraftFromUrlResult = {
  success: boolean;
  error?: string;
  warnings?: UrlAutofillWarning[];
  draft?: {
    name: string;
    description: string;
    category: CharityCategory;
    logoUrl: string;
    website: string;
    contactName: string;
    contactEmail: string;
  };
};

const addWarning = (warnings: UrlAutofillWarning[], warning: UrlAutofillWarning) => {
  if (warnings.some((existing) => existing.code === warning.code)) return;
  warnings.push(warning);
};

const sanitizeUrlForOutput = (value: string) => {
  try {
    const parsed = new URL(value);
    parsed.username = '';
    parsed.password = '';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '';
  }
};

const hostnameToTitle = (hostname: string) => {
  const base = hostname.trim().toLowerCase().replace(/^www\./, '');
  const label = base.split('.')[0] ?? base;
  const words = label.split(/[^a-z0-9]+/g).filter(Boolean);
  const titled = words.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' ').trim();
  return titled.length >= 2 ? titled : base;
};

const ensureHttpsUrl = (value: string | null | undefined, domain: string, warnings: UrlAutofillWarning[]) => {
  if (value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol === 'https:') return parsed.toString();
      if (parsed.protocol === 'http:') {
        parsed.protocol = 'https:';
        addWarning(warnings, {
          code: 'upgraded_url_to_https',
          message: 'Upgraded URL to https:// to avoid mixed content.',
        });
        return parsed.toString();
      }
    } catch {
      // fall through
    }
  }

  return `https://${domain}/favicon.ico`;
};

const toAutofillError = (error: unknown) => {
  if (error instanceof CharityUrlIngestError) {
    switch (error.code) {
      case 'invalid_url':
      case 'invalid_protocol':
        return 'Please enter a valid charity website URL or domain.';
      case 'forbidden_host':
        return 'That URL host is not allowed for security reasons.';
      case 'unsupported_content_type':
        return 'URL must point to a standard website page (HTML).';
      default:
        return 'Could not fetch the charity website for draft generation.';
    }
  }

  if (error instanceof CharityDraftGenerationError) {
    if (error.code === 'missing_api_key') {
      return 'ANTHROPIC_API_KEY is not configured for this deployment.';
    }

    if (error.code === 'invalid_output') {
      return 'The AI draft response was malformed. Please try again or fill fields manually.';
    }

    return 'AI draft generation failed. Please try again.';
  }

  return 'Could not generate a charity draft from that URL.';
};

const buildMinimalPage = (host: string, inputUrl: URL): CharitySourcePage => {
  const sanitized = sanitizeUrlForOutput(inputUrl.toString()) || `https://${host}/`;

  return {
    sourceUrl: sanitized,
    finalUrl: sanitized,
    domain: host,
    title: hostnameToTitle(host),
    description: null,
    ogImageUrl: null,
    textSnippet: '',
    ingest: {
      bytesRead: 0,
      truncated: false,
      contentType: '',
    },
  };
};

const safeCategory = (value: CharityDraft['category'] | null | undefined): CharityCategory => {
  if (value) return value;
  return 'Other';
};

const buildDraft = (params: {
  page: CharitySourcePage;
  aiDraft: CharityDraft | null;
  domain: string;
  warnings: UrlAutofillWarning[];
}) => {
  const domain = params.domain;

  const name = (params.aiDraft?.name ?? params.page.title ?? hostnameToTitle(domain)).trim();
  const description = (
    params.aiDraft?.description ??
    params.page.description ??
    `Draft generated from ${domain}. Review and edit.`
  ).trim();

  const category = safeCategory(params.aiDraft?.category);
  const website =
    sanitizeUrlForOutput(params.aiDraft?.website ?? params.page.finalUrl ?? '') || `https://${domain}/`;

  const logoCandidate = params.aiDraft?.logoUrl ?? params.page.ogImageUrl ?? `https://${domain}/favicon.ico`;
  const logoHttps = ensureHttpsUrl(logoCandidate, domain, params.warnings);

  return {
    name: name.length >= 2 ? name : hostnameToTitle(domain),
    description: description.length >= 2 ? description : `Draft generated from ${domain}.`,
    category,
    logoUrl: logoHttps,
    website,
    contactName: params.aiDraft?.contactName ?? '',
    contactEmail: params.aiDraft?.contactEmail ?? '',
  };
};

export async function autofillCharityDraftFromUrl(rawInput: string): Promise<AutofillCharityDraftFromUrlResult> {
  const startedAt = Date.now();
  const warnings: UrlAutofillWarning[] = [];

  let normalized: ReturnType<typeof normalizeCharityUrlInput>;
  try {
    normalized = normalizeCharityUrlInput(rawInput);
  } catch (error) {
    return { success: false, error: toAutofillError(error) };
  }

  warnings.push(...normalized.warnings);

  let usedProtocol: 'https' | 'http' | 'none' = 'none';
  let finalHost = normalized.primary.hostname;
  let page: CharitySourcePage | null = null;
  let ingestError: unknown = null;

  const tryIngest = async (url: URL) => {
    const result = await ingestCharityWebsite(url.toString());
    usedProtocol = url.protocol === 'http:' ? 'http' : 'https';
    finalHost = result.domain;
    if (result.ingest.truncated) {
      addWarning(warnings, {
        code: 'page_truncated',
        message: 'Large page; analyzed only the first portion (up to 2MB).',
      });
    }
    return result;
  };

  try {
    try {
      page = await tryIngest(normalized.primary);
    } catch (error) {
      ingestError = error;
      if (error instanceof CharityUrlIngestError && error.code === 'forbidden_host') {
        return { success: false, error: toAutofillError(error) };
      }
    }

    if (!page && normalized.fallback) {
      try {
        page = await tryIngest(normalized.fallback);
        addWarning(warnings, {
          code: 'used_http_fallback',
          message: 'HTTPS fetch failed; used an HTTP fallback.',
        });
      } catch (error) {
        ingestError = ingestError ?? error;
        if (error instanceof CharityUrlIngestError && error.code === 'forbidden_host') {
          return { success: false, error: toAutofillError(error) };
        }
      }
    }

    if (!page) {
      if (ingestError instanceof CharityUrlIngestError && ingestError.code === 'unsupported_content_type') {
        addWarning(warnings, {
          code: 'non_html_content',
          message: 'URL did not return a normal website page (HTML). Generated a basic draft.',
        });
      } else {
        addWarning(warnings, {
          code: 'ingest_failed_used_minimal',
          message: 'Could not read the website content. Generated a basic draft.',
        });
      }

      page = buildMinimalPage(finalHost, normalized.primary);
    }

    let aiDraft: CharityDraft | null = null;
    if (!process.env.ANTHROPIC_API_KEY?.trim()) {
      addWarning(warnings, {
        code: 'ai_missing_api_key',
        message: 'AI is not configured for this deployment. Used basic autofill.',
      });
    } else {
      try {
        aiDraft = await generateCharityDraftWithClaude(page);
      } catch (error) {
        if (error instanceof CharityDraftGenerationError) {
          addWarning(warnings, {
            code: 'ai_failed_used_heuristic',
            message: 'AI draft generation failed. Used basic autofill.',
          });
        }
      }
    }

    const domain = page.domain || finalHost;
    const draft = buildDraft({ page, aiDraft, domain, warnings });

    const mirroredLogoUrl = await maybeMirrorCharityLogoToBlob({
      logoUrl: draft.logoUrl,
      charityName: draft.name,
    });

    console.warn(
      JSON.stringify({
        event: 'admin_charity_url_autofill',
        host: normalized.primary.hostname,
        finalHost,
        truncated: Boolean(page.ingest.truncated),
        warnings: warnings.map((warning) => warning.code),
        usedProtocol,
        durationMs: Date.now() - startedAt,
      })
    );

    return {
      success: true,
      draft: {
        ...draft,
        logoUrl: mirroredLogoUrl ?? draft.logoUrl,
      },
      ...(warnings.length > 0 ? { warnings } : {}),
    };
  } catch (error) {
    return { success: false, error: toAutofillError(error) };
  }
}

