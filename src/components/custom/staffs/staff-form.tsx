'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// ---------------- Zod Schemas ----------------

// Schema for creating a staff member (password required)
export const createStaffSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    name: z.string().min(1, { message: 'Name is required' }),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^[0-9+\-\s()]{7,15}$/.test(val), {
            message: 'Invalid phone number format',
        }),
    employeeCode: z.string().min(1, { message: 'Employee Code is required' }),
    isActive: z.boolean().optional(),
});

// Schema for updating a staff member (password excluded)
export const updateStaffSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    name: z.string().min(1, { message: 'Name is required' }),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^[0-9+\-\s()]{7,15}$/.test(val), {
            message: 'Invalid phone number format',
        }),
    employeeCode: z.string().min(1, { message: 'Employee Code is required' }),
    isActive: z.boolean().optional(),
});

// ---------------- TypeScript Types ----------------
type CreateStaffFormValues = z.infer<typeof createStaffSchema>;
type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;
type StaffFormValues = CreateStaffFormValues | UpdateStaffFormValues;

type Staff = {
    id?: string;
    name: string;
    email: string;
    phone: string;
    employeeCode: string;
    isActive: boolean;
    deletedAt?: any;
};

type StaffFormProps = {
    editingStaff: Staff | null;
    formData: {
        email: string;
        name: string;
        phone: string;
        employeeCode: string;
    };
    isPending: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent, values: StaffFormValues) => void;
};

// ---------------- Staff Form Component ----------------
function StaffForm({ editingStaff, formData, isPending, onInputChange, onSubmit }: StaffFormProps) {
    const isEditing = !!editingStaff;

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(isEditing ? updateStaffSchema : createStaffSchema),
        defaultValues: {
            email: formData.email || '',
            password: '', // only used in create mode
            name: formData.name,
            phone: formData.phone,
            employeeCode: formData.employeeCode,
            isActive: editingStaff ? editingStaff.isActive : true,
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        if (isValid) {
            onSubmit(e, form.getValues());
        }
    };

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? 'Update the staff information below.'
                        : 'Enter details for the new staff member.'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="staff@example.com"
                                            {...field}
                                            value={formData.email}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onInputChange(e);
                                            }}
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Password (only for create) */}
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Password <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter secure password"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    onInputChange(e);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                            value={formData.name}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onInputChange(e);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Placeholder for symmetry (no specialty) */}
                        <div />
                    </div>
                    {/* Phone & Employee Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Phone <span className="text-gray-400 text-xs">(optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+91 9876543210"
                                            {...field}
                                            value={formData.phone}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onInputChange(e);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="employeeCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Employee Code <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="STAFF1234"
                                            {...field}
                                            value={formData.employeeCode}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onInputChange(e);
                                            }}
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full md:w-auto"
                        >
                            {isPending ? 'Processing...' : isEditing ? 'Update Staff' : 'Create Staff'}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    );
}

export default StaffForm;