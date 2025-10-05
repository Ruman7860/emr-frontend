'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createStaff, updateStaff, deleteStaff, restoreStaff } from '@/app/actions/staffs/staffs.actions';
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
import StaffForm from './staff-form';
import { Badge } from '@/components/ui/badge';
import { ButtonGroup } from '@/components/ui/button-group';
import { EmptyState } from '../empty-state';

type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  isActive: boolean;
  deletedAt: any;
};

type Props = {
  initialStaffs: Staff[];
};

export default function StaffClient({ initialStaffs }: Props) {
  const [staffs, setStaffs] = useState<Staff[]>(initialStaffs);
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
        const newStaffData = { ...values, isActive: true };
        if (editingStaff) {
          const res = await updateStaff(editingStaff.id, newStaffData, true);
          setStaffs(staffs.map((staff) =>
            staff.id === editingStaff.id ? { ...staff, ...newStaffData } : staff
          ));
          toast.success('Staff updated successfully');
        } else {
          const createdStaff = await createStaff(newStaffData);
          if (createdStaff) {
            setStaffs([...staffs, createdStaff.data]);
          }
          toast.success('Staff created successfully');
        }
        setIsDialogOpen(false);
        setFormData({ email: '', name: '', phone: '', employeeCode: '' });
        setEditingStaff(null);
        router.refresh();
      } catch (error) {
        toast.error('Something went wrong');
        setStaffs(initialStaffs); // Revert to initial state on error
      }
    });
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      email: staff.email,
      name: staff.name,
      phone: staff.phone,
      employeeCode: staff.employeeCode,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        setStaffs(staffs.map(staff =>
          staff.id === id ? { ...staff, deletedAt: new Date(), isActive: false } : staff
        ));
        await deleteStaff(id);
        toast.success('Staff deleted successfully');
        router.refresh();
      } catch (error) {
        toast.error('Failed to delete staff');
        setStaffs(initialStaffs);
      }
    });
  };

  const handleView = (staff: Staff) => {
    toast.info(`Viewing ${staff.name}`);
  };

  const handleRestore = async (id: string) => {
    startTransition(async () => {
      try {
        await restoreStaff(id);
        toast.success('Staff restored successfully');
        setStaffs(staffs.map(s => s.id === id ? { ...s, deletedAt: null, isActive: true } : s));
        router.refresh();
      } catch (error) {
        toast.error('Failed to restore staff');
      }
    });
  };

  const filteredStaffs = staffs.filter(staff =>
    showRemoved ? staff.deletedAt !== null : staff.deletedAt === null
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex px-1 justify-between items-center mb-3">
        <div>
          <h1
            className="text-3xl text-teal-900 dark:text-zinc-300 font-bold tracking-tight"
          >
            Staff
          </h1>
          <Badge>
            Total {showRemoved ? 'Removed' : 'Active'} Staff: {filteredStaffs.length}
          </Badge>
        </div>
        <div className='flex flex-col gap-1'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className='text-xs' size={'sm'} onClick={() => setEditingStaff(null)}>
                <Plus className="text-xs" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
                <DialogDescription>
                  {editingStaff
                    ? 'Update the staff information below.'
                    : 'Enter details for the new staff member.'}
                </DialogDescription>
              </DialogHeader>
              <StaffForm
                editingStaff={editingStaff}
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
              All Active Staff
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
              Removed Staff
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="rounded-lg border text-card-foreground shadow-md">
        <Table>
          <TableHeader>
            <TableRow className='bg-background/50'>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaffs.length > 0 ?
              filteredStaffs.map((staff, index) =>
                <TableRow
                  key={staff.id || index}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.phone || 'N/A'}</TableCell>
                  <TableCell>{staff.email || 'N/A'}</TableCell>
                  <TableCell>{staff.employeeCode}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {staff.isActive ? 'Active' : 'InActive'}
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
                            <DropdownMenuItem onClick={() => handleView(staff)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(staff)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(staff.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRestore(staff.id)}
                              className='text-green-300'
                            >
                              <Power /> Activate
                            </DropdownMenuItem>
                          </>
                        )}
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
                        title="No Removed Staff"
                        description="All staff members are currently active."
                        icon={<Trash2 className="h-6 w-6 text-destructive" />}
                      />
                    ) : (
                      <EmptyState
                        title="No Active Staff"
                        description="You haven’t added any staff yet."
                        icon={<Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
                        actionLabel="Add Staff"
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