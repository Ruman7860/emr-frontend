import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import QueueClient from '@/components/custom/queue/queue-client';
import { getDoctorQueue, getCompletedQueue } from '@/app/actions/queue.actions';

const Page = async () => {
  const session = await getServerSession(authOptions);

  // 1️⃣ Auth check
  if (!session) redirect('/login');

  if (!session.accessToken || isTokenExpired(session.accessToken)) {
    redirect('/login');
  }

  // 2️⃣ Initial queue load (REST) - fetch both active and completed
  const [activeQueueResponse, completedQueueResponse] = await Promise.all([
    getDoctorQueue(),
    getCompletedQueue(),
  ]);

  if (!activeQueueResponse.success) {
    return <div>Error loading queue</div>;
  }

  return (
    <Suspense fallback={<CustomSkeleton />}>
      <QueueClient
        initialQueue={activeQueueResponse.data}
        completedQueue={completedQueueResponse.success ? completedQueueResponse.data : []}
        accessToken={session.accessToken}
      />
    </Suspense>
  );
};

export default Page;

