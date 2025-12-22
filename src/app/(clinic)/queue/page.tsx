import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { isTokenExpired } from '@/lib/checkToken';
import { Suspense } from 'react';
import CustomSkeleton from '@/components/custom/skeleton/custom-skeleton';
import QueueClient from '@/components/custom/queue/queue-client';
import { getDoctorQueue } from '@/app/actions/queue.actions';

const Page = async () => {
  const session = await getServerSession(authOptions);

  // 1️⃣ Auth check
  if (!session) redirect('/login');

  if (!session.accessToken || isTokenExpired(session.accessToken)) {
    redirect('/login');
  }

  // 2️⃣ Initial queue load (REST)
  const queueResponse = await getDoctorQueue();

  if (!queueResponse.success) {
    return <div>Error loading queue</div>;
  }

  return (
    <Suspense fallback={<CustomSkeleton />}>
      <QueueClient
        initialQueue={queueResponse.data}
        accessToken={session.accessToken}
      />
    </Suspense>
  );
};

export default Page;
