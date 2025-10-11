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

// Schema for creating a patient (required fields)
export const createPatientSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date of birth',
    }),
    gender: z.string().min(1, { message: 'Gender is required' }),
    address: z.string().optional(),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10,15}$/.test(val), {
            message: 'Invalid phone number format',
        }),
    registrationFee: z.number().min(1, { message: 'Registration fee must be positive' }),
    doctorId: z.string().optional(),
    isActive:z.boolean()
});

// Schema for updating a patient (optional fields)
export const updatePatientSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date of birth',
    }).optional(),
    gender: z.string().min(1, { message: 'Gender is required' }).optional(),
    address: z.string().optional(),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10,15}$/.test(val), {
            message: 'Invalid phone number format',
        }),
    registrationFee: z.number().min(1, { message: 'Registration fee must be positive' }).optional(),
    doctorId: z.string().optional(),
});

// ---------------- TypeScript Types ----------------
type CreatePatientFormValues = z.infer<typeof createPatientSchema>;
type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>;
type PatientFormValues = CreatePatientFormValues | UpdatePatientFormValues;

type Patient = {
    id?: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: string | null;
    phone: string | null;
    registrationFee: number;
    doctorId: string | null;
    isActive: boolean;
};

type PatientFormProps = {
    editingPatient: Patient | null;
    formData: {
        fullName: string;
        dateOfBirth: string;
        gender: string;
        address: string;
        phone: string;
        registrationFee: string;
        doctorId: string;
    };
    isPending: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent, values: PatientFormValues) => void;
};

// ---------------- Patient Form Component ----------------
function PatientForm({ editingPatient, formData, isPending, onInputChange, onSubmit }: PatientFormProps) {
    const isEditing = !!editingPatient;

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(isEditing ? updatePatientSchema : createPatientSchema),
        defaultValues: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone,
            registrationFee: Number(formData.registrationFee),
            doctorId: formData.doctorId,
            isActive: editingPatient ? editingPatient.isActive : true,
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        if (isValid) {
            const values = form.getValues();
            values.registrationFee = Number(values.registrationFee); // Ensure number
            onSubmit(e, values);
        }
    };

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? 'Update the patient information below.'
                        : 'Enter details for the new patient.'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Full Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                            value={formData.fullName}
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
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Date of Birth <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={formData.dateOfBirth}
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Gender <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="MALE/FEMALE"
                                            {...field}
                                            value={formData.gender}
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Address <span className="text-gray-400 text-xs">(optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123 Main Street"
                                            {...field}
                                            value={formData.address}
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
                            name="registrationFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Registration Fee <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            {...field}
                                            value={formData.registrationFee}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="doctorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Doctor <span className="text-gray-400 text-xs">(optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Doctor ID"
                                            {...field}
                                            value={formData.doctorId}
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
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full md:w-auto"
                        >
                            {isPending ? 'Processing...' : isEditing ? 'Update Patient' : 'Create Patient'}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    );
}

export default PatientForm;