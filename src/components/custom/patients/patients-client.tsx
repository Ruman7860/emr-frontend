'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPatient, updatePatient, deletePatient, restorePatient, getPatients, createRepeatVisit } from '@/app/actions/patients.actions';
import { Patient } from '../../../../types/patient-type';
import Fuse from 'fuse.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, Plus, Power, User, ArrowLeftIcon, ArrowRightIcon, Repeat } from 'lucide-react';
import PatientForm from './patient-form';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '../empty-state';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Loader from '../common/loader';


type Props = {
  initialData: {
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  initialDoctorData: {
    id: string;
    fullName: string;
  }[]
};

type FormData = {
  fullName: string;
  dateOfBirth: string;
  age: number | null;
  gender: string;
  address: string;
  phone: string;
  chiefComplaint: string;
  registrationFee: string;
  doctorId: string;
};

export default function PatientClient({ initialData, initialDoctorData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const currentLimit = Number(searchParams.get('limit') || '10');
  const currentSearch = searchParams.get('search') || '';
  const isDeleted = searchParams.get('deleted') === 'true';
  const currentTab = isDeleted ? 'removed' : 'active';

  const [patients, setPatients] = useState<Patient[]>(initialData.patients || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [loading, setLoading] = useState(false);

  // Repeat Visit state
  const [repeatVisitDialogOpen, setRepeatVisitDialogOpen] = useState(false);
  const [repeatVisitPatient, setRepeatVisitPatient] = useState<Patient | null>(null);
  const [isWithin21Days, setIsWithin21Days] = useState(false);
  const [repeatVisitData, setRepeatVisitData] = useState({
    chiefComplaint: '',
    registrationFee: '',
    doctorId: '',
  });

  // Fuse.js configuration for fuzzy search
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'fullName', weight: 0.4 },
      { name: 'phone', weight: 0.3 },
      { name: 'patientNumber', weight: 0.3 },
    ],
    threshold: 0.4, // Lower = more strict matching
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
  }), []);

  // Create Fuse instance
  const fuse = useMemo(() => new Fuse(patients, fuseOptions), [patients, fuseOptions]);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!localSearch.trim()) return patients;
    const results = fuse.search(localSearch);
    return results.map(result => result.item);
  }, [localSearch, fuse, patients]);

  // Build query string helper
  const buildQueryString = (overrides: Partial<{ page: number; search: string; deleted: boolean }>) => {
    const params = new URLSearchParams();
    params.set('page', (overrides.page ?? currentPage).toString());
    params.set('limit', currentLimit.toString());
    const searchVal = overrides.search ?? localSearch;
    if (searchVal) params.set('search', searchVal);
    const deletedVal = overrides.deleted ?? isDeleted;
    if (deletedVal) params.set('deleted', 'true');
    return `?${params.toString()}`;
  };

  // Fetch patients when query params change
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await getPatients(currentPage, currentLimit, currentSearch, isDeleted);
        if (response.success) {
          const transformedPatients = response.data.patients.map((patient: any) => ({
            id: patient.id,
            fullName: patient.fullName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
            phone: patient.phone,
            age: patient.age,
            patientNumber: patient.patientNumber,
            doctorId: patient.doctorId,
            chiefComplaint: patient.chiefComplaint,
            registrationFee: patient.registrationFee,
            visitStatus: patient.visitStatus,
            lastCompletedVisitDate: patient.lastCompletedVisitDate,
            isActive: !patient.deletedAt && patient.status === 'ACTIVE',
            deletedAt: patient.deletedAt,
          }));
          setPatients(transformedPatients);
          setTotal(response.data.total);
          setTotalPages(response.data.totalPages);
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [currentPage, currentLimit, currentSearch, isDeleted]);

  // Handle search submit - now just for clearing URL params
  const handleClearSearch = () => {
    setLocalSearch('');
    if (currentSearch) {
      router.push(`/patients${buildQueryString({ page: 1, search: '' })}`);
    }
  };

  // Handle tab change
  const handleTabChange = async (value: string) => {
    const newDeleted = value === 'removed';
    router.push(`/patients${buildQueryString({ page: 1, deleted: newDeleted })}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/patients${buildQueryString({ page: newPage })}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    age: null,
    gender: '',
    address: '',
    phone: '',
    chiefComplaint: '',
    registrationFee: '',
    doctorId: '',
  });

  const handleSubmit = async (e: React.FormEvent, values: any) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const newPatientData = { ...values };
        if (editingPatient) {
          const res = await updatePatient(editingPatient.id, newPatientData, true);
          if (res.success) {
            const response = await getPatients(currentPage, currentLimit, currentSearch, isDeleted);
            if (response.success) {
              const transformedPatients = response.data.patients.map((patient: any) => ({
                id: patient.id,
                fullName: patient.fullName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                address: patient.address,
                phone: patient.phone,
                patientNumber: patient.patientNumber,
                doctorId: patient.doctorId,
                registrationFee: patient.registrationFee,
                isActive: !patient.deletedAt && patient.status === 'ACTIVE',
                deletedAt: patient.deletedAt,
              }));
              setPatients(transformedPatients);
              setTotal(response.data.total);
              setTotalPages(response.data.totalPages);
            }
            toast.success('Patient updated successfully');
          } else {
            throw new Error(res.message);
          }
        } else {
          const createdPatient = await createPatient(newPatientData);
          if (createdPatient.success) {
            if (!isDeleted) {
              const response = await getPatients(currentPage, currentLimit, currentSearch, false);
              if (response.success) {
                const transformedPatients = response.data.patients.map((patient: any) => ({
                  id: patient.id,
                  fullName: patient.fullName,
                  dateOfBirth: patient.dateOfBirth,
                  gender: patient.gender,
                  address: patient.address,
                  age: patient.age,
                  phone: patient.phone,
                  patientNumber: patient.patientNumber,
                  doctorId: patient.doctorId,
                  registrationFee: patient.registrationFee,
                  isActive: !patient.deletedAt && patient.status === 'ACTIVE',
                  deletedAt: patient.deletedAt,
                }));
                setPatients(transformedPatients);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
              }
            }
            toast.success('Patient created successfully');
            // navigating to patient detail page.
            router.push(`/patients/${createdPatient.data.id}`);
          } else {
            throw new Error(createdPatient.message);
          }
        }
        setIsSheetOpen(false);
        setFormData({
          fullName: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          age: null,
          chiefComplaint: '',
          phone: '',
          registrationFee: '',
          doctorId: ''
        });
        setEditingPatient(null);
      } catch (error: any) {
        toast.error(error.message || 'Something went wrong');
      }
    });
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      dateOfBirth: new Date(patient.dateOfBirth).toISOString().split('T')[0],
      age: patient.age,
      gender: patient.gender,
      address: patient.address || '',
      phone: patient.phone || '',
      chiefComplaint: patient.chiefComplaint || '',
      registrationFee: patient.registrationFee?.toString() || '',
      doctorId: patient.doctorId || '',
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await deletePatient(id);
        if (res?.success) {
          const response = await getPatients(currentPage, currentLimit, currentSearch, isDeleted);
          if (response.success) {
            const transformedPatients = response.data.patients.map((patient: any) => ({
              id: patient.id,
              fullName: patient.fullName,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              address: patient.address,
              phone: patient.phone,
              patientNumber: patient.patientNumber,
              doctorId: patient.doctorId,
              registrationFee: patient.registrationFee,
              isActive: !patient.deletedAt && patient.status === 'ACTIVE',
              deletedAt: patient.deletedAt,
            }));
            setPatients(transformedPatients);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
          }
          toast.success('Patient deleted successfully');
        } else {
          throw new Error(res.message);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete patient');
      }
    });
  };

  const handleRestore = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await restorePatient(id);
        if (res.success) {
          const response = await getPatients(currentPage, currentLimit, currentSearch, isDeleted);
          if (response.success) {
            const transformedPatients = response.data.patients.map((patient: any) => ({
              id: patient.id,
              fullName: patient.fullName,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              address: patient.address,
              phone: patient.phone,
              patientNumber: patient.patientNumber,
              doctorId: patient.doctorId,
              registrationFee: patient.registrationFee,
              isActive: !patient.deletedAt && patient.status === 'ACTIVE',
              deletedAt: patient.deletedAt,
            }));
            setPatients(transformedPatients);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
          }
          toast.success('Patient restored successfully');
        } else {
          throw new Error(res.message);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to restore patient');
      }
    });
  };

  const handleView = (patient: Patient) => {
    router.push(`/patients/${patient.id}`);
  };

  const handleRepeatVisitOpen = (patient: Patient) => {
    // Calculate if within 21 days of last completed visit
    let within21 = false;
    if (patient.lastCompletedVisitDate) {
      const lastVisitDate = new Date(patient.lastCompletedVisitDate);
      const now = new Date();
      const daysSinceLastVisit = Math.floor(
        (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      within21 = daysSinceLastVisit <= 21;
    }

    setIsWithin21Days(within21);
    setRepeatVisitPatient(patient);
    setRepeatVisitData({
      chiefComplaint: patient.chiefComplaint || '',
      registrationFee: '',
      doctorId: patient.doctorId || '',
    });
    setRepeatVisitDialogOpen(true);
  };

  const handleRepeatVisitSubmit = async () => {
    if (!repeatVisitPatient) return;

    // Validate fee is required when not within 21 days
    if (!isWithin21Days && (!repeatVisitData.registrationFee || Number(repeatVisitData.registrationFee) <= 0)) {
      toast.error('Please enter a valid consultation fee');
      return;
    }

    startTransition(async () => {
      try {
        const payload: {
          chiefComplaint?: string;
          registrationFee?: number;
          doctorId?: string
        } = {
          chiefComplaint: repeatVisitData.chiefComplaint || undefined,
          doctorId: repeatVisitData.doctorId || undefined,
        };

        // Only include fee if not within 21 days (paid visit)
        if (!isWithin21Days && repeatVisitData.registrationFee) {
          payload.registrationFee = Number(repeatVisitData.registrationFee);
        }

        const res = await createRepeatVisit(repeatVisitPatient.id, payload);
        if (res.success) {
          toast.success(isWithin21Days
            ? 'Free follow-up visit created (within 21 days)'
            : 'Repeat visit created successfully');
          setRepeatVisitDialogOpen(false);
          setRepeatVisitPatient(null);
          router.push(`/patients/${repeatVisitPatient.id}`);
        } else {
          throw new Error(res.message);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create repeat visit');
      }
    });
  };

  const getVisitStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Badge className="bg-yellow-500 text-yellow-900" variant="outline">Pending Payment</Badge>;
      case 'PAID_WAITING':
        return <Badge className="bg-blue-300 text-blue-900" variant="outline">Paid Waiting</Badge>;
      case 'IN_CONSULTATION':
        return <Badge className="bg-green-500 text-green-900" variant="outline">In Consultation</Badge>;
      case 'NO_SHOW':
        return <Badge className="bg-red-500 text-red-900" variant="outline">No Show</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-200 text-green-900" variant="outline">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-200 text-red-900" variant="outline">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-gray-900" variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex px-1 justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl text-teal-900 dark:text-zinc-300 font-bold tracking-tight">Patients</h1>
          <Badge>Total {isDeleted ? 'Removed' : 'Active'} Patients: {total}</Badge>
        </div>
        <div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">Add Patient</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
              <PatientForm
                initialDoctorData={initialDoctorData}
                formData={formData}
                isPending={isPending}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex mb-4 w-full">
        <Input
          placeholder="Search by name, phone, or patient number..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full h-8 text-xs placeholder:text-xs outline-none focus-visible:ring-0"
        />
        {localSearch && (
          <Button
            variant="outline"
            size={"sm"}
            className='ml-3'
            onClick={handleClearSearch}
          >
            Clear
          </Button>
        )}
        {localSearch && (
          <span className="text-xs text-muted-foreground self-center ml-2">
            {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full mb-4">
        <TabsList className="grid border bg-transparent w-full grid-cols-2">
          <TabsTrigger value="active">All Active Patients</TabsTrigger>
          <TabsTrigger value="removed">Removed Patients</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border text-card-foreground shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-background/50">
              <TableHead className="font-semibold">Full Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Patient Number</TableHead>
              <TableHead>Last Visit Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  <Loader size='sm' />
                </TableCell>
              </TableRow>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => handleView(patient)}
                >
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>{patient.patientNumber}</TableCell>
                  <TableCell>{getVisitStatusBadge(patient.visitStatus)}</TableCell>
                  <TableCell>
                    {patient.deletedAt ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Removed
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${patient.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {!isDeleted ? (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(patient);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            {patient.visitStatus === 'COMPLETED' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRepeatVisitOpen(patient);
                                }}
                              >
                                <Repeat className="mr-2 h-4 w-4" /> Repeat Visit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(patient);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(patient.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(patient.id);
                              }}
                              className="text-green-300"
                            >
                              <Power /> Activate
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  {localSearch ? (
                    <EmptyState
                      title="No Matching Patients"
                      description={`No patients found matching "${localSearch}"`}
                      icon={<User className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
                    />
                  ) : isDeleted ? (
                    <EmptyState
                      title="No Removed Patients"
                      description="All patients are currently active."
                      icon={<Trash2 className="h-6 w-6 text-destructive" />}
                    />
                  ) : (
                    <EmptyState
                      title="No Active Patients"
                      description="You haven't added any patients yet."
                      icon={<User className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
                      actionLabel="Add Patient"
                      onAction={() => setIsSheetOpen(true)}
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredPatients.length > 0 && !localSearch && <div className="flex justify-end gap-3 items-center mt-4">
        <Button
          disabled={currentPage <= 1 || isPending || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          size={'sm'}
        >
          <ArrowLeftIcon />
        </Button>
        <span className='text-xs'>Page {currentPage} of {totalPages}</span>
        <Button
          disabled={currentPage >= totalPages || isPending || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          size={'sm'}
        >
          <ArrowRightIcon />
        </Button>
      </div>}

      {/* Repeat Visit Dialog */}
      <Dialog open={repeatVisitDialogOpen} onOpenChange={setRepeatVisitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isWithin21Days ? 'Free Follow-up Visit' : 'Repeat Visit'}
            </DialogTitle>
            <DialogDescription>
              {isWithin21Days
                ? `Free follow-up for ${repeatVisitPatient?.fullName} (within 21 days of last visit)`
                : `Create a paid visit for ${repeatVisitPatient?.fullName}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isWithin21Days && (
              <div className="space-y-2">
                <Label htmlFor="repeatVisitFee">
                  Consultation Fee (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="repeatVisitFee"
                  type="number"
                  min={1}
                  placeholder="Enter consultation fee"
                  value={repeatVisitData.registrationFee}
                  onChange={(e) =>
                    setRepeatVisitData({ ...repeatVisitData, registrationFee: e.target.value })
                  }
                  className="focus-visible:ring-0"
                />
              </div>
            )}
            {isWithin21Days && (
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ✓ Free follow-up visit (no payment required)
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  This patient visited within the last 21 days
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="repeatVisitComplaint">
                Chief Complaint <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Textarea
                id="repeatVisitComplaint"
                placeholder="Symptoms / reason for visit"
                value={repeatVisitData.chiefComplaint}
                onChange={(e) =>
                  setRepeatVisitData({ ...repeatVisitData, chiefComplaint: e.target.value })
                }
                className="resize-none focus-visible:ring-0"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Assign Doctor <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Select
                value={repeatVisitData.doctorId}
                onValueChange={(value) =>
                  setRepeatVisitData({ ...repeatVisitData, doctorId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {initialDoctorData.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRepeatVisitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRepeatVisitSubmit}
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Visit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}