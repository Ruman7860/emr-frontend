'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createDoctor, updateDoctor, deleteDoctor, restoreDoctor } from '@/app/actions/doctors/doctors.actions';
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
import { MoreHorizontal, Eye, Pencil, Trash2, Plus, Power, Stethoscope } from 'lucide-react';
import DoctorForm from './doctor-form';
import { Badge } from '@/components/ui/badge';
import { ButtonGroup } from '@/components/ui/button-group';
import { EmptyState } from '../empty-state';

type Doctor = {
  id: string;
  name: string;
  email:string;
  specialty: string;
  phone: string;
  employeeCode: string;
  isActive: boolean;
  deletedAt: any;
};

type Props = {
  initialDoctors: Doctor[];
};

export default function DoctorClient({ initialDoctors }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [formData, setFormData] = useState({
    email:'',
    name: '',
    specialty: '',
    phone: '',
    employeeCode: '',
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, values: any) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const newDoctorData = { ...values, isActive: true };
        if (editingDoctor) {
          const res = await updateDoctor(editingDoctor.id, newDoctorData,true);
          setDoctors(doctors.map((doc) =>
            doc.id === editingDoctor.id ? { ...doc, ...newDoctorData } : doc
          ));
          toast.success('Doctor updated successfully');
        } else {
          const createdDoctor = await createDoctor(newDoctorData);
          if (createdDoctor) {
            setDoctors([...doctors, createdDoctor.data]);
          }
          toast.success('Doctor created successfully');
        }
        setIsDialogOpen(false);
        setFormData({ email:'',name: '', specialty: '', phone: '', employeeCode: '' });
        setEditingDoctor(null);
        router.refresh();
      } catch (error) {
        toast.error('Something went wrong');
        setDoctors(initialDoctors); // Revert to initial state on error
      }
    });
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      email:doctor.email,
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      employeeCode: doctor.employeeCode,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        setDoctors(doctors.map(doc =>
          doc.id === id ? { ...doc, deletedAt: new Date(), isActive:false } : doc
        ));

        await deleteDoctor(id);
        toast.success('Doctor deleted successfully');
        router.refresh(); // optional: keep this to sync server state
      } catch (error) {
        toast.error('Failed to delete doctor');
        setDoctors(initialDoctors);
      }
    });
  };

  const handleView = (doctor: Doctor) => {
    toast.info(`Viewing ${doctor.name}`);
  };

  const handleRestore = async (id: string) => {
    startTransition(async () => {
      try {
        await restoreDoctor(id); // calls backend API
        toast.success('Doctor restored successfully');
        setDoctors(doctors.map(d => d.id === id ? { ...d, deletedAt: null, isActive: true } : d));
        router.refresh();
      } catch (error) {
        toast.error('Failed to restore doctor');
      }
    });
  };

  const filteredDoctors = doctors.filter(doctor =>
    showRemoved ? doctor.deletedAt !== null : doctor.deletedAt === null
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex px-1 justify-between items-center mb-3">
        <div>
          <h1
            className="text-3xl text-teal-900 dark:text-zinc-300 font-bold tracking-tight"
          >
            Doctors
          </h1>
          <Badge>
            Total {showRemoved ? 'Removed' : 'Active'} Doctors: {filteredDoctors.length}
          </Badge>
        </div>
        <div className='flex flex-col gap-1'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className='text-xs' size={'sm'} onClick={() => setEditingDoctor(null)}>
                <Plus className="text-xs" /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
                <DialogDescription>
                  {editingDoctor
                    ? 'Update the doctor information below.'
                    : 'Enter details for the new doctor.'}
                </DialogDescription>
              </DialogHeader>
              <DoctorForm
                editingDoctor={editingDoctor}
                formData={formData}
                isPending={isPending}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
          <ButtonGroup>
            <Button
              onClick={() => setShowRemoved(false)}
              className={`text-xs cursor-pointer transition-colors ${!showRemoved
                ? 'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-800 dark:hover:bg-teal-400'
                : 'bg-transparent text-teal-900 hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-teal-800'
                }`}
              size="sm"
              variant={'outline'}
            >
              All Active Doctors
            </Button>

            <Button
              onClick={() => setShowRemoved(true)}
              className={`text-xs cursor-pointer transition-colors ${showRemoved
                ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400'
                : 'bg-transparent text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800'
                }`}
              size="sm"
              variant={'outline'}
            >
              Removed Doctors
            </Button>
          </ButtonGroup>

        </div>
      </div>
      <div className="rounded-lg border text-card-foreground shadow-md">
        <Table>
          <TableHeader>
            <TableRow className='bg-background/50'>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length > 0 ?
              filteredDoctors.map((doctor, index) =>
                <TableRow
                  key={doctor.id || index}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialty || 'General Physician'}</TableCell>
                  <TableCell>{doctor.phone || 'N/A'}</TableCell>
                  <TableCell>{doctor.employeeCode}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {doctor.isActive ? 'Active' : 'InActive'}
                    </span>
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
                        {!showRemoved ? (
                          <>
                            <DropdownMenuItem onClick={() => handleView(doctor)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(doctor)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(doctor.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        ) : <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRestore(doctor.id)}
                            className='text-green-300'>
                            <Power /> Activate
                          </DropdownMenuItem>
                        </>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ) :
              (
                <TableRow>
                  <TableCell colSpan={6}>
                    {showRemoved ? (
                      <EmptyState
                        title="No Removed Doctors"
                        description="All doctors are currently active."
                        icon={<Trash2 className="h-6 w-6 text-destructive" />}
                      />
                    ) : (
                      <EmptyState
                        title="No Active Doctors"
                        description="You haven’t added any doctors yet."
                        icon={<Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
                        actionLabel="Add Doctor"
                        onAction={() => setIsDialogOpen(true)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )

            }
          </TableBody>
        </Table>
      </div>
    </div>
  );
}