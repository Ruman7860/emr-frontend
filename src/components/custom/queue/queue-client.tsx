'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { startConsultation, cancelVisit } from '@/app/actions/queue.actions';

interface QueueClientProps {
  initialQueue: any[];
  completedQueue: any[];
  accessToken: string;
}

export default function QueueClient({
  initialQueue,
  completedQueue,
  accessToken,
}: QueueClientProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [completed, setCompleted] = useState(completedQueue);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
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

  const handleCancelVisit = async (patientId: string, visitId: string) => {
    try {
      setCancellingId(visitId);
      const result = await cancelVisit({ patientId, visitId });

      if (result.success) {
        toast.success('Visit cancelled successfully');
        // Move from active to completed
        const cancelledItem = queue.find((q) => q.visitId === visitId);
        if (cancelledItem) {
          setQueue((prev) => prev.filter((q) => q.visitId !== visitId));
          setCompleted((prev) => [{
            ...cancelledItem,
            visitStatus: 'CANCELLED',
            patient: { ...cancelledItem.patient, visitStatus: 'CANCELLED' },
          }, ...prev]);
        }
      } else {
        toast.error(result.message || 'Failed to cancel visit');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs}s`;
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

    const handleConsultationEnd = (payload: any) => {
      // Move from active queue to completed
      const completedItem = queue.find((q) => q.visitId === payload.visitId);
      if (completedItem) {
        setQueue((prev) => prev.filter((q) => q.visitId !== payload.visitId));
        setCompleted((prev) => [{
          ...completedItem,
          visitStatus: 'COMPLETED',
          patient: { ...completedItem.patient, visitStatus: 'COMPLETED' },
          consultationTime: payload.consultationTime
        }, ...prev]);
      }
    };

    socket.on('QUEUE_REMOVE', handleQueueRemove);
    socket.on('CONSULTATION_START', handleConsultationStart);
    socket.on('QUEUE_UPDATE', handleQueueUpdate);
    socket.on('CONSULTATION_END', handleConsultationEnd);

    return () => {
      socket.off('QUEUE_REMOVE', handleQueueRemove);
      socket.off('CONSULTATION_START', handleConsultationStart);
      socket.off('QUEUE_UPDATE', handleQueueUpdate);
      socket.off('CONSULTATION_END', handleConsultationEnd);
    };
  }, [socket, currentDoctorId, queue]);

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
      case 'COMPLETED':
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const waitingCount = queue.filter(q => q.patient.visitStatus === 'PAID_WAITING').length;
  const inConsultationCount = queue.filter(q => q.patient.visitStatus === 'IN_CONSULTATION').length;
  const completedCount = completed.filter(q => q.visitStatus === 'COMPLETED').length;
  const cancelledCount = completed.filter(q => q.visitStatus === 'CANCELLED').length;

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">
            Active Queue ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed/Cancelled ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">

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
                          {item.patient.visitStatus === 'COMPLETED' ? (
                            <span>
                              Completed - Duration: {item.consultationTime ? formatDuration(item.consultationTime) : 'N/A'}
                            </span>
                          ) : isInConsultation ? (
                            <span>In consultation {formatDistanceToNow(new Date(item.visitDate), { addSuffix: true })}</span>
                          ) : (
                            <span>Waiting {formatDistanceToNow(new Date(item.visitDate), { addSuffix: true })}</span>
                          )}                 </div>
                      </div>

                      {/* Right - Action Buttons (Only for Doctors) */}
                      {isDoctor && (
                        <div className="flex gap-2">
                          {item.patient.visitStatus === 'COMPLETED' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm"
                              onClick={() => router.push(`/consultation/${item.patient.id}`)}
                            >
                              View Prescription
                            </Button>
                          ) : isMyConsultation ? (
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelVisit(item.patient.id, item.visitId)}
                                disabled={cancellingId === item.visitId}
                              >
                                {cancellingId === item.visitId ? 'Cancelling...' : 'Cancel Visit'}
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
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No completed or cancelled visits today
            </p>
          ) : (
            <div className="grid gap-4">
              {completed.map((item, index) => (
                <Card key={item.visitId} className="hover:shadow-md transition">
                  <CardContent className="px-4 flex justify-between items-center">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold text-lg">
                          {item.patient.fullName}
                        </p>
                        {getStatusBadge(item.visitStatus)}
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
                        {item.visitStatus === 'COMPLETED' ? (
                          <span>
                            Duration: {item.consultationTime ? formatDuration(item.consultationTime) : 'N/A'}
                          </span>
                        ) : (
                          <span>Cancelled</span>
                        )}
                      </div>
                    </div>

                    {isDoctor && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-sm"
                          onClick={() => router.push(`/consultation/${item.patient.id}`)}
                        >
                          View Prescription
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
