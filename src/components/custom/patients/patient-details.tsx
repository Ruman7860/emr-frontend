'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Phone, MapPin, Stethoscope, DollarSign, FileText, Pencil, Circle, Activity, Slash, Clock, CreditCard, Info } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface PatientDetailsProps {
    patientDetails: {
            id: string;
            fullName: string;
            dateOfBirth: string;
            gender: string;
            address: string;
            phone: string;
            status: string;
            registeredById: string;
            registrationFee: number;
            doctorId: string;
            referredTo: string | null;
            referredReason: string | null;
            patientNumber: string;
            noOfVisits: number;
            createdAt: string;
            updatedAt: string;
            deletedAt: string | null;
            tenantId: string;
            doctor: {
                id: string;
                userId: string;
                tenantId: string;
                specialty: string;
                phone: string;
                isActive: boolean;
                employeeCode: string;
                createdAt: string;
                deletedAt: string | null;
            };
            visits: Array<{
                id: string;
                patientId: string;
                doctorId: string;
                staffId: string;
                visitDate: string;
                notes: string;
                consultationFee: number;
                feeValidUntil: string | null;
                createdAt: string;
                deletedAt: string | null;
            }>;
            billing: Array<{
                id: string;
                patientId: string;
                date: string;
                type: string;
                amount: number;
                status: string;
                paymentMode: string | null;
                createdAt: string;
                deletedAt: string | null;
            }>;
            labTests: Array<any>;
            operations: Array<any>;
    };
}

export default function PatientDetails({ patientDetails }: PatientDetailsProps) {
    const router = useRouter();

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Activity className="h-5 w-5 text-green-500" />;
            case 'INACTIVE':
                return <Slash className="h-5 w-5 text-red-500" />;
            case 'UNPAID':
            case 'PENDING':
                return <Clock className="h-5 w-5 text-orange-500" />;
            case 'PAID':
                return <CreditCard className="h-5 w-5 text-green-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex mb-3 items-center">
                <div className="flex-1">
                    <h1 className="text-3xl text-teal-900 dark:text-zinc-300 font-bold tracking-tight">
                        Patient Details
                    </h1>
                </div>
                <div className="justify-end flex gap-2 items-center text-xs">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs cursor-pointer"
                        onClick={() => { router.push(`/patients/${patientDetails.id}/visits`) }}
                    >
                        Patient History
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                        <Pencil className="text-xs" /> Edit Patient
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="col-span-1 lg:col-span-2 shadow-md border-none bg-background/40 p-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg sm:text-xl px-2">Profile</CardTitle>
                        <Separator />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                        <p className="text-base font-semibold">{patientDetails.fullName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                        <p className="text-base font-semibold">
                                            {format(new Date(patientDetails.dateOfBirth), "PPP")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <MapPin className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                                        <p className="text-base font-semibold">{patientDetails.address}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="text-base font-semibold">{patientDetails.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Stethoscope className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Assigned Doctor</p>
                                        <p className="text-base font-semibold">
                                            {patientDetails.doctor.specialty} (ID: {patientDetails.doctor.employeeCode})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(patientDetails?.status)}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <p className="text-base font-semibold">
                                            <Badge>{patientDetails.status || "N/A"}</Badge>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md border-none bg-background/40 p-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg sm:text-xl px-2">Summary</CardTitle>
                        <Separator />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Registration Fee</p>
                                    <p className="text-base font-semibold">₹{patientDetails.registrationFee}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                                    <p className="text-base font-semibold">
                                        {format(new Date(patientDetails.createdAt), "PPP")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-base font-semibold">
                                        {format(new Date(patientDetails.updatedAt), "PPP")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="visits" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border rounded-lg">
                    <TabsTrigger value="visits" className=" text-xs sm:text-sm">Visits ({patientDetails.visits.length})</TabsTrigger>
                    <TabsTrigger value="billing" className="text-xs sm:text-sm">Billing ({patientDetails.billing.length})</TabsTrigger>
                    <TabsTrigger value="labTests" className="text-xs sm:text-sm">Lab Tests ({patientDetails.labTests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="visits" className="">
                    <Card className="shadow-md border-none bg-background/40 p-4">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg sm:text-xl px-2">Patient History</CardTitle>
                            <Separator />
                        </CardHeader>
                        <CardContent className="p-0">
                            {patientDetails.visits.length > 0 ? (
                                <div className="space-y-4">
                                    {patientDetails.visits.map((visit) => (
                                        <div key={visit.id} className="border-b pb-4 last:border-b-0">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {format(new Date(visit.visitDate), "PPP")}
                                                    </p>
                                                    <p className="text-base font-semibold">{visit.notes}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs sm:text-sm">₹{visit.consultationFee}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center">No visits recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="">
                    <Card className="shadow-md border-none bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Billing History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {patientDetails.billing.length > 0 ? (
                                <div className="space-y-4">
                                    {patientDetails.billing.map((bill) => (
                                        <div key={bill.id} className="border-b pb-4 last:border-b-0">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {format(new Date(bill.date), "PPP")} - {bill.type}
                                                    </p>
                                                    <p className="text-base font-semibold">₹{bill.amount}</p>
                                                </div>
                                                <Badge
                                                    variant={bill.status === "UNPAID" ? "destructive" : "secondary"}
                                                    className="text-xs sm:text-sm"
                                                >
                                                    {bill.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center">No billing records.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="labTests" className="">
                    <Card className="shadow-md border-none bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Lab Tests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {patientDetails.labTests.length > 0 ? (
                                <div className="space-y-4">
                                    {patientDetails.labTests.map((test) => (
                                        <div key={test.id} className="border-b pb-4 last:border-b-0">
                                            <p className="text-base font-semibold">{test.name}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center">No lab tests recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}