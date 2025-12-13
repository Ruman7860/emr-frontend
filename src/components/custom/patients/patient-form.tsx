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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';


export const createPatientSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  dateOfBirth: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: 'Invalid date of birth',
    }),
  age: z.number().int().min(0, { message: 'Age must be ≥ 0' }),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'Gender is required' }),
  chiefComplaint: z
    .string()
    .min(1, { message: 'Symptoms / reason is required' }),
  registrationFee: z
    .number()
    .min(1, { message: 'Fee must be positive' }),
  address: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{10,15}$/.test(v), {
      message: 'Phone must be 10-15 digits',
    }),
  doctorId: z.string().optional(),
});

type CreatePatientFormValues = z.infer<typeof createPatientSchema>;

type PatientFormProps = {
  formData: {
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
  initialDoctorData: {
    id: string;
    fullName: string;
  }[];
  isPending: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent, values: CreatePatientFormValues) => void;
};


export default function PatientForm({
  formData,
  isPending,
  onInputChange,
  onSubmit,
  initialDoctorData
}: PatientFormProps) {
  const form = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      age: formData.age ? Number(formData.age) : 0,
      gender: formData.gender as 'MALE' | 'FEMALE' | undefined,
      address: formData.address,
      phone: formData.phone,
      chiefComplaint: formData.chiefComplaint,
      registrationFee: formData.registrationFee
        ? Number(formData.registrationFee)
        : 0,
      doctorId: formData.doctorId,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    values.age = Number(values.age);
    values.registrationFee = Number(values.registrationFee);
    onSubmit(e, values);
  };

  return (
    <>
      <SheetHeader className="h-20">
        <SheetTitle>Add Patient</SheetTitle>
        <SheetDescription>
          Enter details for the new patient.
        </SheetDescription>
      </SheetHeader>
      <Separator />

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Row 1: Full Name & DOB */}
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
                      className='focus-visible:ring-0'
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
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className='focus-visible:ring-0'
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

          {/* Row 2: Age & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Age <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="45"
                      {...field}
                      value={formData.age || ''}
                      className='focus-visible:ring-0'
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : 0;
                        field.onChange(val);
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Sync with parent
                      const synthEvent = {
                        target: { name: 'gender', value },
                      } as React.ChangeEvent<HTMLInputElement>;
                      onInputChange(synthEvent);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Phone & Registration Fee */}
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
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Fee (₹){' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="500"
                      {...field}
                      value={formData.registrationFee || ''}
                      className='focus-visible:ring-0'
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : 0;
                        field.onChange(val);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address{' '}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="123 Main Street, Village, District"
                    className="resize-none focus-visible:ring-0"
                    rows={2}
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

          {/* Chief Complaint */}
          <FormField
            control={form.control}
            name="chiefComplaint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Symptoms / Reason for Visit{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Fever for 3 days, cough, body pain"
                    className="resize-none focus-visible:ring-0"
                    rows={3}
                    {...field}
                    value={formData.chiefComplaint}
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

          {/* Doctor ID */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem className=''>
                <FormLabel>
                  Assign Doctor{' '}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const synthEvent = {
                      target: { name: 'doctorId', value },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onInputChange(synthEvent);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {initialDoctorData.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <SheetFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto"
            >
              {isPending ? 'Creating...' : 'Create Patient'}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
}