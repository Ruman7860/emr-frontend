'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from '@/components/custom/common/custom-tabs';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User, Calendar, Phone, MapPin, Stethoscope, Activity, Clock,
    DollarSign, FileText, Pencil, CreditCard, AlertCircle,
    View,
    Eye
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import CollectPaymentModal from "./collect-payment";
import { useState, useEffect } from "react";
import { collectPatientPayment } from "@/app/actions/patients.actions";
import { getStatusBadge } from "@/util/getStatusBadge";
import { useSocket } from "@/context/socket-context";

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

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        console.log('Patient page: Socket accessible:', socket.connected ? '✅ Connected' : '❌ Disconnected');
    }, [socket]);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const router = useRouter();

    const hasUnpaidBilling = patientDetails.overview.todayVisit?.billings?.some(
        (b: any) => b.status === "UNPAID"
    );
    const unpaidBilling =
        patientDetails.overview.todayVisit?.billings?.find(
            (b: any) => b.status === "UNPAID"
        );

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
            <CustomTabs defaultValue="overview" className="w-full">
                <CustomTabsList className="grid grid-cols-4 w-full mb-6 bg-muted/50">
                    <CustomTabsTrigger value="overview">Overview</CustomTabsTrigger>
                    <CustomTabsTrigger value="visits">Visits ({patientDetails.visits.length})</CustomTabsTrigger>
                    <CustomTabsTrigger value="billing">Billing ({patientDetails.payments.length})</CustomTabsTrigger>
                    <CustomTabsTrigger value="records">Records</CustomTabsTrigger>
                </CustomTabsList>

                {/* Overview Tab */}
                <CustomTabsContent value="overview" className="space-y-6">
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
                                        Latest Visit
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
                </CustomTabsContent>

                {/* Visits Tab */}
                <CustomTabsContent value="visits">
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
                                                    <p className="font-semibold mb-1">₹{visit.visitFee || 0}</p>
                                                    {/* Use visit-specific status, fallback to COMPLETED if not present (legacy data) */}
                                                    {getStatusBadge(visit.visitStatus || "COMPLETED")}
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
                </CustomTabsContent>

                {/* Billing Tab */}
                <CustomTabsContent value="billing">
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
                </CustomTabsContent>

                {/* Records Tab (Lab Tests, Prescriptions, etc.) */}
                <CustomTabsContent value="records">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-teal-600" />
                                    Lab Tests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patientDetails.labTests.length > 0 ? (
                                    <div className="space-y-3">
                                        {patientDetails.labTests.map((test: any) => (
                                            <div key={test.id} className="p-3 border rounded-lg bg-muted/20">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{test.tests}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(test.createdAt), "dd MMM yyyy")}
                                                    </p>
                                                </div>
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
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-teal-600" />
                                    Prescriptions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patientDetails.prescriptions.length > 0 ? (
                                    <div className="space-y-3">
                                        {patientDetails.prescriptions.map((pres: any) => (
                                            <div key={pres.id} className="p-3 border rounded-lg bg-muted/20">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">Prescription #{pres.id.slice(-6)}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {pres.medications?.length || 0} Medications
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(pres.createdAt), "dd MMM yyyy")}
                                                    </p>
                                                </div>
                                                <div className="mt-4 rounded-lg p-4 text-black dark:text-white">
                                                    <h4 className="mb-3 text-sm font-semibold">
                                                        Related Documents
                                                    </h4>

                                                    {pres.prescriptionDocuments?.length ? (
                                                        <ul className="space-y-2">
                                                            {pres.prescriptionDocuments.map((doc: any) => (
                                                                <li
                                                                    key={doc.id}
                                                                    className="flex items-center justify-between rounded-md px-3 py-2 shadow-sm transition"
                                                                >
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                                                                            Rx
                                                                        </span>
                                                                        <span>Prescription {doc.version}</span>
                                                                    </div>

                                                                    <a
                                                                        href={doc.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm font-medium hover:text-indigo-800"
                                                                    >
                                                                        <Eye className="h-4 w-4"/>
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm italic">
                                                            No related documents available
                                                        </p>
                                                    )}
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted" />
                                        <p>No prescriptions recorded.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CustomTabsContent>
            </CustomTabs>

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