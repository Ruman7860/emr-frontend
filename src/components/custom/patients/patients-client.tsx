'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPatient, updatePatient, deletePatient, restorePatient, getPatients } from '@/app/actions/patients.actions';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, Plus, Power, User,ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
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

type Patient = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  phone: string | null;
  doctorId: string | null;
  registrationFee: number;
  patientNumber: string;
  isActive: boolean;
  deletedAt: Date | null;
};

type Props = {
  initialData: {
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function PatientClient({ initialData }: Props) {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [loading, setLoading] = useState(false);

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
            patientNumber: patient.patientNumber,
            doctorId: patient.doctorId,
            registrationFee: patient.registrationFee,
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

  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/patients${buildQueryString({ page: 1, search: localSearch })}`);
  };

  // Handle tab change
  const handleTabChange = async (value: string) => {
    const newDeleted = value === 'removed';
    router.push(`/patients${buildQueryString({ page: 1, deleted: newDeleted })}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/patients${buildQueryString({ page: newPage })}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    registrationFee: '',
    doctorId: '',
  });

  // Create / Update
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
          } else {
            throw new Error(createdPatient.message);
          }
        }
        setIsDialogOpen(false);
        setFormData({ fullName: '', dateOfBirth: '', gender: '', address: '', phone: '', registrationFee: '', doctorId: '' });
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
      gender: patient.gender,
      address: patient.address || '',
      phone: patient.phone || '',
      registrationFee: '',
      doctorId: patient.doctorId || '',
    });
    setIsDialogOpen(true);
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex px-1 justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl text-teal-900 dark:text-zinc-300 font-bold tracking-tight">Patients</h1>
          <Badge>Total {isDeleted ? 'Removed' : 'Active'} Patients: {total}</Badge>
        </div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-xs" size="sm" onClick={() => setEditingPatient(null)}>
                <Plus className="text-xs" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                <DialogDescription>
                  {editingPatient ? 'Update the patient information below.' : 'Enter details for the new patient.'}
                </DialogDescription>
              </DialogHeader>
              <PatientForm
                editingPatient={editingPatient}
                formData={formData}
                isPending={isPending}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex mb-4 space-x-2">
        <Input
          placeholder="Search by name or patient number"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <Button type="submit">Search</Button>
        {localSearch && (
          <Button
            variant="outline"
            onClick={() => {
              setLocalSearch('');
              handleSearch();
            }}
          >
            Clear
          </Button>
        )}
      </form>

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
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Patient Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <Loader size='sm' />
                </TableCell>
              </TableRow>
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => handleView(patient)}
                >
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>{patient.patientNumber}</TableCell>
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
                <TableCell colSpan={7}>
                  {isDeleted ? (
                    <EmptyState
                      title="No Removed Patients"
                      description="All patients are currently active."
                      icon={<Trash2 className="h-6 w-6 text-destructive" />}
                    />
                  ) : (
                    <EmptyState
                      title="No Active Patients"
                      description="You haven’t added any patients yet."
                      icon={<User className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
                      actionLabel="Add Patient"
                      onAction={() => setIsDialogOpen(true)}
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {patients.length > 0 && <div className="flex justify-end gap-3 items-center mt-4">
        <Button
          disabled={currentPage <= 1 || isPending || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          size={'sm'}
        >
          <ArrowLeftIcon/>
        </Button>
        <span className='text-xs'>Page {currentPage} of {totalPages}</span>
        <Button
          disabled={currentPage >= totalPages || isPending || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          size={'sm'}
        >
          <ArrowRightIcon/>
        </Button>
      </div>}
    </div>
  );
}