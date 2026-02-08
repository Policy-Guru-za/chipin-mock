import { describe, expect, it } from 'vitest';

import {
  parseAdminCharityFilters,
  parseAdminContributionFilters,
  parseAdminDreamBoardFilters,
  parseAdminHostFilters,
  parseAdminPayoutFilters,
  parseAdminReportWindow,
  parseReportMonthYear,
} from '@/lib/admin/query-params';
import { encodeCursor } from '@/lib/api/pagination';

describe('admin query param parsers', () => {
  it('parses dream board filters with cursor and limits', () => {
    const cursor = encodeCursor({ createdAt: new Date('2026-02-01T00:00:00.000Z'), id: 'db-1' });
    const params = new URLSearchParams({
      limit: '120',
      cursor,
      status: 'active,closed,invalid',
      created_from: '2026-01-01T00:00:00.000Z',
      created_to: '2026-02-01T00:00:00.000Z',
      host_id: 'host-1',
      search: 'maya',
    });

    const result = parseAdminDreamBoardFilters(params);

    expect(result.limit).toBe(120);
    expect(result.statuses).toEqual(['active', 'closed']);
    expect(result.cursor?.id).toBe('db-1');
    expect(result.hostId).toBe('host-1');
    expect(result.search).toBe('maya');
  });

  it('parses contribution and payout filters', () => {
    const contributionParams = new URLSearchParams({
      status: 'completed,failed',
      provider: 'payfast,ozow',
      dream_board_id: 'db-2',
      search: 'Ava',
    });

    const payoutParams = new URLSearchParams({
      status: 'pending,completed',
      type: 'karri_card,charity',
      gift_method: 'bank',
      charity_id: 'charity-1',
    });

    const contributions = parseAdminContributionFilters(contributionParams);
    const payouts = parseAdminPayoutFilters(payoutParams);

    expect(contributions.statuses).toEqual(['completed', 'failed']);
    expect(contributions.paymentProviders).toEqual(['payfast', 'ozow']);
    expect(contributions.dreamBoardId).toBe('db-2');
    expect(payouts.statuses).toEqual(['pending', 'completed']);
    expect(payouts.types).toEqual(['karri_card', 'charity']);
    expect(payouts.giftMethod).toBe('bank');
    expect(payouts.charityId).toBe('charity-1');
  });

  it('parses charity and host filters safely', () => {
    const charityParams = new URLSearchParams({
      is_active: 'true',
      category: 'education',
      search: 'hope',
      limit: '400',
    });

    const hostParams = new URLSearchParams({
      min_board_count: '5',
      search: 'gmail.com',
    });

    const charities = parseAdminCharityFilters(charityParams);
    const hosts = parseAdminHostFilters(hostParams);

    expect(charities.isActive).toBe(true);
    expect(charities.category).toBe('education');
    expect(charities.limit).toBe(200);
    expect(hosts.minBoardCount).toBe(5);
    expect(hosts.search).toBe('gmail.com');
  });

  it('parses report month and range defaults', () => {
    const params = new URLSearchParams({ month: '15', year: '2010' });
    const windowParams = new URLSearchParams({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T00:00:00.000Z',
    });

    const monthYear = parseReportMonthYear(params);
    const range = parseAdminReportWindow(windowParams);

    expect(monthYear.month).toBe(12);
    expect(monthYear.year).toBe(2020);
    expect(range.from.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });

  it('rejects invalid calendar dates for filter inputs', () => {
    const dreamBoardParams = new URLSearchParams({
      created_from: '2026-02-31T00:00:00.000Z',
      created_to: '2026-13-01T00:00:00.000Z',
    });
    const windowParams = new URLSearchParams({
      from: '2026-11-31T00:00:00.000Z',
      to: '2026-00-10T00:00:00.000Z',
    });

    const dreamBoards = parseAdminDreamBoardFilters(dreamBoardParams);
    const range = parseAdminReportWindow(windowParams);

    expect(dreamBoards.createdFrom).toBeUndefined();
    expect(dreamBoards.createdTo).toBeUndefined();
    expect(range.from.toISOString()).not.toBe('2026-11-31T00:00:00.000Z');
    expect(range.to.toISOString()).not.toBe('2026-00-10T00:00:00.000Z');
  });
});
