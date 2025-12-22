'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from '@/components/custom/common/custom-tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPrescriptionsByVisit, createPrescription, updatePrescription, deletePrescription } from '@/app/actions/prescriptions.actions';
import { toast } from 'sonner';

interface Medication {
    drugName: string;
    dosage: string;
    frequency?: string;
    timing?: string;
    duration?: string;
    instructions?: string;
}

interface Prescription {
    id: string;
    visitId: string;
    patientId: string;
    medications: Medication[];
    createdAt: string;
}

interface ConsultationClientProps {
    patientData: any;
}

export default function ConsultationClient({ patientData }: ConsultationClientProps) {
    const [timer, setTimer] = useState(0);
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPrescription, setFetchingPrescription] = useState(true);

    const [newMedication, setNewMedication] = useState({
        drugName: '',
        dosage: '1 tablet',
        frequency: '2 times a day',
        timing: 'after meals',
        duration: '3 days',
        instructions: '',
    });

    const visitId = patientData?.overview?.todayVisit?.id;
    const patientId = patientData?.header?.id;

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch prescriptions on mount
    useEffect(() => {
        if (visitId) {
            fetchPrescriptions();
        }
    }, [visitId]);

    const fetchPrescriptions = async () => {
        try {
            setFetchingPrescription(true);
            const response = await getPrescriptionsByVisit(visitId);
            if (response.success && response.data && response.data.length > 0) {
                // Get the most recent prescription
                const latestPrescription = response.data[0];
                setPrescription(latestPrescription);
                setMedications(latestPrescription.medications || []);
            } else {
                setPrescription(null);
                setMedications([]);
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            toast.error('Failed to load prescriptions');
        } finally {
            setFetchingPrescription(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')} min ${String(secs).padStart(2, '0')}s`;
    };

    const handleAddMedication = async () => {
        if (!newMedication.drugName) {
            toast.error('Please enter a medication name');
            return;
        }

        try {
            setLoading(true);
            const updatedMedications = [...medications, { ...newMedication }];

            if (prescription) {
                // Update existing prescription
                const response = await updatePrescription(prescription.id, {
                    medications: updatedMedications,
                });

                if (response.success) {
                    setMedications(updatedMedications);
                    setPrescription({ ...prescription, medications: updatedMedications });
                    toast.success('Medication added successfully');
                } else {
                    throw new Error(response.message || 'Failed to update prescription');
                }
            } else {
                // Create new prescription
                const response = await createPrescription({
                    visitId,
                    patientId,
                    medications: updatedMedications,
                });

                if (response.success) {
                    setPrescription(response.data);
                    setMedications(updatedMedications);
                    toast.success('Prescription created successfully');
                } else {
                    throw new Error(response.message || 'Failed to create prescription');
                }
            }

            // Reset form
            setNewMedication({
                drugName: '',
                dosage: '1 tablet',
                frequency: '2 times a day',
                timing: 'after meals',
                duration: '3 days',
                instructions: '',
            });
        } catch (error: any) {
            console.error('Error adding medication:', error);
            toast.error(error.message || 'Failed to add medication');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMedication = async (index: number) => {
        if (!prescription) return;

        try {
            setLoading(true);
            const updatedMedications = medications.filter((_, i) => i !== index);

            if (updatedMedications.length === 0) {
                // Delete the entire prescription if no medications left
                const response = await deletePrescription(prescription.id);
                if (response.success) {
                    setPrescription(null);
                    setMedications([]);
                    toast.success('Prescription deleted successfully');
                } else {
                    throw new Error(response.message || 'Failed to delete prescription');
                }
            } else {
                // Update prescription with remaining medications
                const response = await updatePrescription(prescription.id, {
                    medications: updatedMedications,
                });

                if (response.success) {
                    setMedications(updatedMedications);
                    setPrescription({ ...prescription, medications: updatedMedications });
                    toast.success('Medication removed successfully');
                } else {
                    throw new Error(response.message || 'Failed to update prescription');
                }
            }
        } catch (error: any) {
            console.error('Error deleting medication:', error);
            toast.error(error.message || 'Failed to delete medication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Patient Header */}
            <Card>
                <CardContent className="px-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{patientData.header.fullName}</h1>
                                <span className="text-muted-foreground">
                                    {patientData.header.age} y {patientData.header.gender}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Visit Id: #{patientData.overview.todayVisit?.id?.slice(-4) || 'N/A'}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Complaint:</span>{' '}
                                <span className="text-muted-foreground">{patientData.overview.chiefComplaint || 'N/A'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Complaint entered 7 days end</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4" />
                                <span>: {formatTime(timer)}</span>
                            </div>
                            <Button size="sm">End Consultation</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <CustomTabs defaultValue="notes" className="w-full">
                <CustomTabsList>
                    <CustomTabsTrigger value="notes">Notes</CustomTabsTrigger>
                    <CustomTabsTrigger value="prescription">Prescription</CustomTabsTrigger>
                    <CustomTabsTrigger value="labs">Labs/Tests</CustomTabsTrigger>
                    <CustomTabsTrigger value="documents">Documents</CustomTabsTrigger>
                </CustomTabsList>

                <CustomTabsContent value="notes" className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">Notes content will go here...</p>
                        </CardContent>
                    </Card>
                </CustomTabsContent>

                <CustomTabsContent value="prescription" className="space-y-6">
                    {/* Add Medication */}
                    <Card>
                        <CardContent className="space-y-4">
                            <h3 className="text-lg font-semibold">Add Medication</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Medication</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type medication name..."
                                            value={newMedication.drugName}
                                            onChange={(e) => setNewMedication({ ...newMedication, drugName: e.target.value })}
                                            className="flex-1"
                                        />
                                        <Select value={newMedication.dosage} onValueChange={(val) => setNewMedication({ ...newMedication, dosage: val })}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1 tablet">1 tablet</SelectItem>
                                                <SelectItem value="2 tablets">2 tablets</SelectItem>
                                                <SelectItem value="1 spoon">1 spoon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={newMedication.frequency} onValueChange={(val) => setNewMedication({ ...newMedication, frequency: val })}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1 time a day">1 time a day</SelectItem>
                                                <SelectItem value="2 times a day">2 times a day</SelectItem>
                                                <SelectItem value="3 times a day">3 times a day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={newMedication.timing} onValueChange={(val) => setNewMedication({ ...newMedication, timing: val })}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="after meals">after meals</SelectItem>
                                                <SelectItem value="before meals">before meals</SelectItem>
                                                <SelectItem value="with meals">with meals</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Duration"
                                            value={newMedication.duration}
                                            onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                                            className="w-32"
                                        />
                                        <Button onClick={handleAddMedication} disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Textarea
                                        placeholder="Additional Notes...&#10;e.g. Take with plenty of water"
                                        value={newMedication.instructions}
                                        onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                                        className="min-h-20"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription List */}
                    <Card>
                        <CardContent className="space-y-4">
                            <h3 className="text-lg font-semibold">Prescription</h3>

                            {fetchingPrescription ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : medications.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">No medications added yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {medications.map((med, index) => (
                                        <div key={index} className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{med.drugName}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {med.dosage}
                                                    {med.frequency && `, ${med.frequency}`}
                                                    {med.timing && ` ${med.timing}`}
                                                    {med.duration && ` - ${med.duration}`}
                                                </p>
                                                {med.instructions && (
                                                    <p className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteMedication(index)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CustomTabsContent>

                <CustomTabsContent value="labs" className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">Labs/Tests content will go here...</p>
                        </CardContent>
                    </Card>
                </CustomTabsContent>

                <CustomTabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">Documents content will go here...</p>
                        </CardContent>
                    </Card>
                </CustomTabsContent>
            </CustomTabs>
        </div>
    );
}
