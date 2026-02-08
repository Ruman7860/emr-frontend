export type Patient = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  age: number | null;
  chiefComplaint: string | null;
  phone: string | null;
  doctorId: string | null;
  registrationFee: number;
  patientNumber: string;
  visitStatus: string;
  lastCompletedVisitDate: string | null;
  isActive: boolean;
  deletedAt: Date | null;
};