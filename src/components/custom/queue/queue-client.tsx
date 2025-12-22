'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { startConsultation } from '@/app/actions/queue.actions';

interface QueueClientProps {
  initialQueue: any[];
  accessToken: string;
}

export default function QueueClient({
  initialQueue,
  accessToken,
}: QueueClientProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { socket } = useSocket();
  const router = useRouter();
  const { data: session } = useSession();

  // Get user role and doctor ID from session
  const userRole = (session as any)?.user?.role || (session as any)?.role;
  const currentDoctorId = (session as any)?.user?.id || (session as any)?.id;
  const isDoctor = userRole === 'DOCTOR';

  const handleStartConsultation = async (patientId: string, visitId: string) => {
    try {
      setLoadingId(visitId);
      const result = await startConsultation({ patientId, visitId });

      if (result.success) {
        toast.success('Consultation started');
        router.push(`/consultation/${patientId}`);
      } else {
        toast.error(result.message || 'Failed to start consultation');
        setLoadingId(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      setLoadingId(null);
    }
  };

  const handleResumeConsultation = (patientId: string) => {
    router.push(`/consultation/${patientId}`);
  };

  useEffect(() => {
    if (!socket) return;

    const handleQueueRemove = (payload: any) => {
      setQueue((prev) =>
        prev.filter((q) => q.visitId !== payload.visitId)
      );
    };

    const handleConsultationStart = (payload: any) => {
      // Update the queue item status instead of removing
      setQueue((prev) =>
        prev.map((q) =>
          q.visitId === payload.visitId
            ? { ...q, status: 'IN_CONSULTATION', doctorId: payload.doctorId }
            : q
        )
      );
    };

    const handleQueueUpdate = (payload: any) => {
      // Update queue item with new status
      setQueue((prev) =>
        prev.map((q) =>
          q.visitId === payload.visitId
            ? { ...q, ...payload }
            : q
        )
      );
    };

    socket.on('QUEUE_REMOVE', handleQueueRemove);
    socket.on('CONSULTATION_START', handleConsultationStart);
    socket.on('QUEUE_UPDATE', handleQueueUpdate);

    return () => {
      socket.off('QUEUE_REMOVE', handleQueueRemove);
      socket.off('CONSULTATION_START', handleConsultationStart);
      socket.off('QUEUE_UPDATE', handleQueueUpdate);
    };
  }, [socket, currentDoctorId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID_WAITING':
        return (
          <Badge className="bg-orange-500 text-white hover:bg-orange-600">
            Waiting
          </Badge>
        );
      case 'IN_CONSULTATION':
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            In Consultation
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const waitingCount = queue.filter(q => q.patient.visitStatus === 'PAID_WAITING').length;
  const inConsultationCount = queue.filter(q => q.patient.visitStatus === 'IN_CONSULTATION').length;

  return (
    <div className="container mx-auto p-6">   
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Patient Queue
        </h1>
        <div className="flex gap-2">
          <Badge className="px-3 py-1 bg-orange-500 text-white">
            {waitingCount} Waiting
          </Badge>
          <Badge className="px-3 py-1 bg-blue-500 text-white">
            {inConsultationCount} In Consultation
          </Badge>
        </div>
      </div>

      {queue.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No patients in queue
        </p>
      ) : (
        <div className="grid gap-4">
          {queue.map((item, index) => {
            const isInConsultation = item.patient.visitStatus === 'IN_CONSULTATION';
            const isMyConsultation = isInConsultation && item.patient.doctorUserId === currentDoctorId;
            const isLockedByOther = isInConsultation && item.patient.doctorUserId !== currentDoctorId;

            return (
              <Card
                key={item.visitId}
                className={`hover:shadow-md transition ${isLockedByOther ? 'opacity-75' : ''}`}
              >
                <CardContent className="px-4 flex justify-between items-center">
                  {/* Left */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold text-lg">
                        {item.patient.fullName}
                      </p>
                      <Badge variant="outline">
                        #{index + 1}
                      </Badge>
                      {getStatusBadge(item.patient.visitStatus)}
                      {isLockedByOther && (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          🔒 Locked
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {item.patient.age} yrs • {item.patient.gender}
                    </p>

                    <p className="text-sm">
                      <span className="font-medium">Complaint:</span>{' '}
                      {item.chiefComplaint || '—'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {isInConsultation ? 'In consultation' : 'Waiting since'}{' '}
                      {formatDistanceToNow(
                        new Date(item.visitDate),
                        { addSuffix: true }
                      )}
                    </div>
                  </div>

                  {/* Right - Action Buttons (Only for Doctors) */}
                  {isDoctor && (
                    <div className="flex gap-2">
                      {isMyConsultation ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 cursor-pointer text-sm"
                          onClick={() => handleResumeConsultation(item.patient.id)}
                        >
                          Resume Consultation
                        </Button>
                      ) : !isInConsultation ? (
                        <>
                          <Button
                            size="sm"
                            className="text-sm"
                            onClick={() => handleStartConsultation(item.patient.id, item.visitId)}
                            disabled={loadingId === item.visitId}
                          >
                            {loadingId === item.visitId ? 'Starting...' : 'Start Consultation'}
                          </Button>
                          <Button size="sm" variant="outline" className="text-sm">
                            Skip
                          </Button>
                        </>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
