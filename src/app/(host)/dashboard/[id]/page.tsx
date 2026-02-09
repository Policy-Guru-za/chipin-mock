import { redirect } from 'next/navigation';

import { DashboardDetailClient } from '@/app/(host)/dashboard/[id]/DashboardDetailClient';
import { DashboardPostCampaignClient } from '@/app/(host)/dashboard/[id]/DashboardPostCampaignClient';
import { updateDreamBoard } from '@/app/(host)/dashboard/[id]/actions';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { buildDashboardDetailViewModel } from '@/lib/host/dashboard-view-model';
import {
  getDashboardDetailExpanded,
  listBirthdayMessages,
  listCompletedContributionsForDreamBoard,
  listPayoutsForDreamBoard,
} from '@/lib/host/queries';

export default async function DreamBoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireHostAuth();
  const board = await getDashboardDetailExpanded(id, session.hostId);

  if (!board) {
    redirect('/dashboard');
  }

  const [payoutRows, contributions, messages] = await Promise.all([
    listPayoutsForDreamBoard(board.id),
    listCompletedContributionsForDreamBoard(board.id),
    listBirthdayMessages(board.id),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const view = buildDashboardDetailViewModel(board, payoutRows, { baseUrl });

  if (view.isComplete) {
    return (
      <DashboardPostCampaignClient
        view={view}
        contributions={contributions}
        messages={messages}
      />
    );
  }

  return (
    <DashboardDetailClient
      view={view}
      contributions={contributions}
      messages={messages}
      updateAction={updateDreamBoard}
    />
  );
}
