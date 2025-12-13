'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User, Calendar, Phone, MapPin, Stethoscope, Activity, Clock,
    DollarSign, FileText, Pencil, CreditCard, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import CollectPaymentModal from "./collect-payment";
import { useState } from "react";
import { collectPatientPayment } from "@/app/actions/patients.actions";

interface PatientDetailsProps {
    patientDetails: {
        header: {
            id: string;
            fullName: string;
            age: number;
            gender: string;
            phone: string;
            patientNumber: string;
            visitStatus: string;
            dateOfBirth: string | null;
            address: string;
            status: string;
            createdAt: string;
            updatedAt: string;
        };
        overview: {
            chiefComplaint: string | null;
            todayVisit: any | null;
        };
        visits: any[];
        payments: any[];
        labTests: any[];
        operations: any[];
        prescriptions: any[];
    };
}

export default function PatientDetails({ patientDetails }: PatientDetailsProps) {
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const router = useRouter();

    const hasUnpaidBilling = patientDetails.overview.todayVisit?.billings?.some(
        (b: any) => b.status === "UNPAID"
    );
    const unpaidBilling =
        patientDetails.overview.todayVisit?.billings?.find(
            (b: any) => b.status === "UNPAID"
        );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="destructive">Inactive</Badge>;
            case 'PENDING_PAYMENT':
            case 'UNPAID':
                return <Badge className="bg-orange-100 text-orange-800">Pending Payment</Badge>;
            case 'PAID':
                return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
            default:
                return <Badge variant="secondary">{status || "Unknown"}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {/* Header with Title and Actions */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-900 dark:text-zinc-100">
                            {patientDetails.header.fullName}
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>#{patientDetails.header.patientNumber}</span>
                            <span>•</span>
                            <span>{patientDetails.header.age} years, {patientDetails.header.gender}</span>
                            {hasUnpaidBilling && (
                                <>
                                    <span>•</span>
                                    <Badge className="bg-red-100 text-red-800">Unpaid Bill</Badge>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {hasUnpaidBilling && (
                            <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-xs"
                                onClick={() => setOpenPaymentModal(true)}
                            >
                                <DollarSign className="h-2 w-2" />
                                Collect Payment
                            </Button>
                        )}
                        <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit Patient
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-6 bg-muted/50">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits ({patientDetails.visits.length})</TabsTrigger>
                    <TabsTrigger value="billing">Billing ({patientDetails.payments.length})</TabsTrigger>
                    <TabsTrigger value="records">Records</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-teal-600" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {patientDetails.header.phone}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Address</span>
                                    <span className="font-medium text-right max-w-[60%]">
                                        <MapPin className="h-4 w-4 inline mr-1" />
                                        {patientDetails.header.address || "Not provided"}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    {getStatusBadge(patientDetails.header.status)}
                                </div>
                            </CardContent>
                        </Card>

                        {patientDetails.overview.todayVisit && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-teal-600" />
                                        Today&apos;s Visit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-muted-foreground">Chief Complaint</p>
                                        <p className="font-medium">{patientDetails.overview.chiefComplaint}</p>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Doctor</span>
                                        <span className="font-medium">
                                            Dr. {patientDetails.overview.todayVisit.doctor?.user?.name || "N/A"}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Visit Fee</span>
                                        <span className="font-semibold text-lg">₹{patientDetails.overview.todayVisit.visitFee || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Visit Status</span>
                                        {getStatusBadge(patientDetails.header.visitStatus)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patientDetails.visits.length > 0 ? (
                                <div className="space-y-6">
                                    {patientDetails.visits.map((visit) => (
                                        <div key={visit.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">
                                                        {format(new Date(visit.visitDate), "dd MMM yyyy")}
                                                        {visit.isFirstVisit && <Badge className="ml-2" variant="outline">First Visit</Badge>}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Dr. {visit.doctor?.user?.name || "Unknown"}
                                                    </p>
                                                    <p className="mt-2">{visit.notes || visit.chiefComplaint}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{visit.visitFee || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No visit history available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patientDetails.payments.length > 0 ? (
                                <div className="space-y-4">
                                    {patientDetails.payments.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-4 rounded-lg border bg-muted/30">
                                            <div>
                                                <p className="font-medium">{payment.type.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(payment.date), "dd MMM yyyy")}
                                                    {payment.paymentMode && ` • ${payment.paymentMode}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">₹{payment.amount}</p>
                                                {getStatusBadge(payment.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No billing records.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Records Tab (Lab Tests, Prescriptions, etc.) */}
                <TabsContent value="records">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lab Tests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patientDetails.labTests.length > 0 ? (
                                    <div className="space-y-3">
                                        {patientDetails.labTests.map((test: any) => (
                                            <div key={test.id} className="p-3 border rounded-lg">
                                                <p className="font-medium">{test.name}</p>
                                                <p className="text-sm text-muted-foreground">{test.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6">No lab tests ordered.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Prescriptions & Operations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center text-muted-foreground py-10">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted" />
                                    <p>No prescriptions or operations recorded yet.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Payment Modal */}
            <CollectPaymentModal
                open={openPaymentModal}
                onClose={() => setOpenPaymentModal(false)}
                registrationFee={unpaidBilling?.amount || 0}
                onConfirm={async ({ amount, paymentMode, markPaid }) => {
                    await collectPatientPayment({
                        patientId: patientDetails.header.id,
                        visitId: patientDetails.overview.todayVisit!.id,
                        billingType: unpaidBilling.type, // ✅ REQUIRED
                        amount,
                        paymentMode,
                        markPaid,
                    });
                    setOpenPaymentModal(false);
                }}
            />
        </div>
    );
}