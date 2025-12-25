'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from '@/components/custom/common/custom-tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Trash2, Loader2, Edit, Plus, FileText, Download } from 'lucide-react';
import { getPrescriptionsByVisit, createPrescription, updatePrescription, deletePrescription } from '@/app/actions/prescriptions.actions';
import { getLabTestsByVisit, createLabTest, updateLabTest, deleteLabTest } from '@/app/actions/labtests.actions';
import { getNotesByVisit, updateNotes } from '@/app/actions/notes.actions';
import { generatePrescriptionPDF } from '@/app/actions/prescription-pdf.actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface LabTest {
    id: string;
    visitId: string;
    patientId: string;
    tests: string;
    createdAt: string;
}

interface ConsultationClientProps {
    patientData: any;
}

export default function ConsultationClient({ patientData }: ConsultationClientProps) {
    const [timer, setTimer] = useState(0);

    // Prescription state
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loadingPrescription, setLoadingPrescription] = useState(false);
    const [fetchingPrescription, setFetchingPrescription] = useState(true);

    // LabTest state
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [labTestContent, setLabTestContent] = useState('');
    const [loadingLabTest, setLoadingLabTest] = useState(false);
    const [fetchingLabTest, setFetchingLabTest] = useState(true);
    const [showLabTestForm, setShowLabTestForm] = useState(false);
    const [editingLabTest, setEditingLabTest] = useState<LabTest | null>(null);

    // Notes state
    const [notes, setNotes] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [fetchingNotes, setFetchingNotes] = useState(true);

    // PDF generation state
    const [generatingPDF, setGeneratingPDF] = useState(false);

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

    // Fetch all data on mount
    useEffect(() => {
        if (visitId) {
            fetchPrescriptions();
            fetchLabTests();
            fetchNotes();
        }
    }, [visitId]);

    const fetchPrescriptions = async () => {
        try {
            setFetchingPrescription(true);
            const response = await getPrescriptionsByVisit(visitId);
            if (response.success && response.data && response.data.length > 0) {
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

    const fetchLabTests = async () => {
        try {
            setFetchingLabTest(true);
            const response = await getLabTestsByVisit(visitId);
            if (response.success && response.data) {
                setLabTests(response.data);
            } else {
                setLabTests([]);
            }
        } catch (error) {
            console.error('Error fetching lab tests:', error);
            toast.error('Failed to load lab tests');
        } finally {
            setFetchingLabTest(false);
        }
    };

    const fetchNotes = async () => {
        try {
            setFetchingNotes(true);
            const response = await getNotesByVisit(visitId);
            if (response.success && response.data) {
                setNotes(response.data.notes || '');
            } else {
                setNotes('');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to load notes');
        } finally {
            setFetchingNotes(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')} min ${String(secs).padStart(2, '0')}s`;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
        } catch {
            return dateString;
        }
    };

    // Prescription handlers
    const handleAddMedication = async () => {
        if (!newMedication.drugName) {
            toast.error('Please enter a medication name');
            return;
        }

        try {
            setLoadingPrescription(true);
            const updatedMedications = [...medications, { ...newMedication }];

            if (prescription) {
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
            setLoadingPrescription(false);
        }
    };

    const handleDeleteMedication = async (index: number) => {
        if (!prescription) return;

        try {
            setLoadingPrescription(true);
            const updatedMedications = medications.filter((_, i) => i !== index);

            if (updatedMedications.length === 0) {
                const response = await deletePrescription(prescription.id);
                if (response.success) {
                    setPrescription(null);
                    setMedications([]);
                    toast.success('Prescription deleted successfully');
                } else {
                    throw new Error(response.message || 'Failed to delete prescription');
                }
            } else {
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
            setLoadingPrescription(false);
        }
    };

    // LabTest handlers
    const handleAddLabTest = () => {
        setShowLabTestForm(true);
        setEditingLabTest(null);
        setLabTestContent('');
    };

    const handleEditLabTest = (labTest: LabTest) => {
        setShowLabTestForm(true);
        setEditingLabTest(labTest);
        setLabTestContent(labTest.tests);
    };

    const handleSaveLabTest = async () => {
        if (!labTestContent.trim()) {
            toast.error('Please enter lab test details');
            return;
        }

        try {
            setLoadingLabTest(true);

            if (editingLabTest) {
                const response = await updateLabTest(editingLabTest.id, {
                    tests: labTestContent,
                });

                if (response.success) {
                    await fetchLabTests();
                    setShowLabTestForm(false);
                    setLabTestContent('');
                    setEditingLabTest(null);
                    toast.success('Lab test updated successfully');
                } else {
                    throw new Error(response.message || 'Failed to update lab test');
                }
            } else {
                const response = await createLabTest({
                    visitId,
                    patientId,
                    tests: labTestContent,
                });

                if (response.success) {
                    await fetchLabTests();
                    setShowLabTestForm(false);
                    setLabTestContent('');
                    toast.success('Lab test created successfully');
                } else {
                    throw new Error(response.message || 'Failed to create lab test');
                }
            }
        } catch (error: any) {
            console.error('Error saving lab test:', error);
            toast.error(error.message || 'Failed to save lab test');
        } finally {
            setLoadingLabTest(false);
        }
    };

    const handleCancelLabTest = () => {
        setShowLabTestForm(false);
        setLabTestContent('');
        setEditingLabTest(null);
    };

    const handleDeleteLabTest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lab test?')) return;

        try {
            setLoadingLabTest(true);
            const response = await deleteLabTest(id);

            if (response.success) {
                await fetchLabTests();
                toast.success('Lab test deleted successfully');
            } else {
                throw new Error(response.message || 'Failed to delete lab test');
            }
        } catch (error: any) {
            console.error('Error deleting lab test:', error);
            toast.error(error.message || 'Failed to delete lab test');
        } finally {
            setLoadingLabTest(false);
        }
    };

    // Notes handlers
    const handleSaveNotes = async () => {
        try {
            setLoadingNotes(true);

            const response = await updateNotes(visitId, notes, patientId);

            if (response.success) {
                toast.success('Notes saved successfully');
            } else {
                throw new Error(response.message || 'Failed to save notes');
            }
        } catch (error: any) {
            console.error('Error saving notes:', error);
            toast.error(error.message || 'Failed to save notes');
        } finally {
            setLoadingNotes(false);
        }
    };

    // PDF generation handler
    const handleGeneratePDF = async () => {
        if (!prescription) {
            toast.error('No prescription found. Please add medications first.');
            return;
        }

        try {
            setGeneratingPDF(true);
            const response = await generatePrescriptionPDF(visitId, 1);

            if (response.success && response.data) {
                window.open(response.data.downloadUrl, '_blank');
                toast.success('Prescription PDF generated successfully!');
            } else {
                throw new Error(response.message || 'Failed to generate PDF');
            }
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            toast.error(error.message || 'Failed to generate prescription PDF');
        } finally {
            setGeneratingPDF(false);
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

            {/* Tabs - Reordered: Prescription | Labs/Tests | Notes | Documents */}
            <CustomTabs defaultValue="prescription" className="w-full">
                <CustomTabsList>
                    <CustomTabsTrigger value="prescription">Prescription</CustomTabsTrigger>
                    <CustomTabsTrigger value="labtest">Labs/Tests</CustomTabsTrigger>
                    <CustomTabsTrigger value="notes">Notes</CustomTabsTrigger>
                    <CustomTabsTrigger value="documents">Documents</CustomTabsTrigger>
                </CustomTabsList>

                {/* Prescription Tab */}
                <CustomTabsContent value="prescription" className="space-y-6">
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
                                        <Button onClick={handleAddMedication} disabled={loadingPrescription}>
                                            {loadingPrescription ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
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

                    <Card>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Prescription</h3>
                                {prescription && medications.length > 0 && (
                                    <Button
                                        onClick={handleGeneratePDF}
                                        disabled={generatingPDF}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {generatingPDF ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4" />
                                                Generate PDF
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

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
                                                disabled={loadingPrescription}
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

                {/* LabTest Tab */}
                <CustomTabsContent value="labtest" className="space-y-6">
                    <Card>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Lab Tests</h3>
                                {!showLabTestForm && (
                                    <Button onClick={handleAddLabTest} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Lab Test
                                    </Button>
                                )}
                            </div>

                            {showLabTestForm && (
                                <div className="space-y-4 border rounded-lg p-4 bg-accent/20">
                                    <Textarea
                                        placeholder="Enter lab test details...&#10;e.g. CBC, Blood Sugar, Lipid Profile"
                                        value={labTestContent}
                                        onChange={(e) => setLabTestContent(e.target.value)}
                                        className="min-h-32"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={handleCancelLabTest} disabled={loadingLabTest}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveLabTest} disabled={loadingLabTest}>
                                            {loadingLabTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            {editingLabTest ? 'Update' : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {fetchingLabTest ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : labTests.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">No lab tests added yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {labTests.map((labTest) => (
                                        <div key={labTest.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm whitespace-pre-wrap">{labTest.tests}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDate(labTest.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleEditLabTest(labTest)}
                                                    disabled={loadingLabTest}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteLabTest(labTest.id)}
                                                    disabled={loadingLabTest}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CustomTabsContent>

                {/* Notes Tab */}
                <CustomTabsContent value="notes" className="space-y-6">
                    <Card>
                        <CardContent className="space-y-4">
                            <h3 className="text-lg font-semibold">Consultation Notes</h3>

                            {fetchingNotes ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <Textarea
                                        placeholder="Enter consultation notes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-32"
                                    />
                                    <div className="flex justify-end">
                                        <Button onClick={handleSaveNotes} disabled={loadingNotes}>
                                            {loadingNotes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Save Notes
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </CustomTabsContent>

                {/* Documents Tab */}
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
