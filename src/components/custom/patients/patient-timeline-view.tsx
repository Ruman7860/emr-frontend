// components/custom/patients/patient-timeline-view.tsx (update your client component)
// First, install required shadcn components if not already installed:
// pnpm dlx shadcn-ui@latest add card badge accordion table

// Install date-fns for date formatting:
// pnpm add date-fns

'use client'

import React from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, DollarSign, UserPlus, Stethoscope } from 'lucide-react' // Assuming lucide-react is installed via shadcn
import { Separator } from '@/components/ui/separator'

interface Prescription {
  drugName: string
  dosage: string
  duration?: string
  instructions: string
}

interface VisitDetails {
  doctor: { id: string; name: string }
  staff: { id: string; name: string }
  notes: string
  consultationFee: number
  prescriptions: Prescription[]
}

interface BillingDetails {
  type: string
  amount: number
  status: string
  paymentMode: string | null
}

interface RegistrationDetails {
  fullName: string
  patientNumber: string
  registrationFee: number
}

interface TimelineEvent {
  type: 'VISIT' | 'BILLING' | 'REGISTRATION'
  date: string
  details: VisitDetails | BillingDetails | RegistrationDetails
}

interface Patient {
  id: string
  fullName: string
  patientNumber: string
}

interface PatientTimelineData {
  patient: Patient
  timeline: TimelineEvent[]
}

interface PatientTimeLineViewClientProps {
  data: PatientTimelineData
}

const PatientTimeLineViewClient: React.FC<PatientTimeLineViewClientProps> = ({ data }) => {
  const { patient, timeline } = data

  // Sort timeline by date descending (latest first) if not already sorted
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getIcon = (type: string) => {
    switch (type) {
      case 'VISIT':
        return <Stethoscope className="h-4 w-4" />
      case 'BILLING':
        return <DollarSign className="h-4 w-4" />
      case 'REGISTRATION':
        return <UserPlus className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const renderDetails = (event: TimelineEvent) => {
    switch (event.type) {
      case 'VISIT':
        const visit = event.details as VisitDetails
        return (
          <Accordion type="single" collapsible className="w-full bg-transparent">
            <AccordionItem value="visit-details">
              <AccordionTrigger className="text-left">View Visit Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-md font-medium dark:text-gray-200 text-gray-700">Doctor:</span>
                    <span className="text-lg font-bold">{visit.doctor.name}</span>
                  </p>
                  <Separator />

                  <p className="flex justify-between">
                    <span className="text-md font-medium dark:text-gray-200 text-gray-700">Staff:</span>
                    <span className="text-lg font-bold">{visit.staff.name}</span>
                  </p>
                  <Separator />

                  <p className="flex justify-between">
                    <span className="text-md font-medium dark:text-gray-200 text-gray-700">Notes:</span>
                    <span className="text-lg font-bold">{visit.notes || 'N/A'}</span>
                  </p>
                  <Separator />

                  <p className="flex justify-between">
                    <span className="text-md font-medium dark:text-gray-200 text-gray-700">Consultation Fee:</span>
                    <span className="text-lg font-bold">${visit.consultationFee.toLocaleString()}</span>
                  </p>

                  {visit.prescriptions.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-md font-medium dark:text-gray-200 text-gray-700">Prescriptions:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Drug Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Dosage</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Duration</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Instructions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visit.prescriptions.map((pres, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-gray-800 dark:text-gray-100">{pres.drugName}</TableCell>
                              <TableCell className="text-gray-800 dark:text-gray-100">{pres.dosage}</TableCell>
                              <TableCell className="text-gray-800 dark:text-gray-100">{pres.duration || 'N/A'}</TableCell>
                              <TableCell className="text-gray-800 dark:text-gray-100">{pres.instructions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )

      case 'BILLING':
        const billing = event.details as BillingDetails
        return (
          <div className="space-y-2">
            <p className='flex justify-between'>
              <span className='text-md font-medium dark:text-gray-200 text-gray-700 '>Billing Type:</span>
              <span className='text-lg font-bold '>{billing.type}</span>
            </p>
            <Separator />
            <p className='flex justify-between'>
              <span className='text-md font-medium dark:text-gray-200 text-gray-700'>Amount:</span>
              <span className='text-lg font-bold '> ${billing.amount.toLocaleString()}</span>
            </p>
            <Separator />
            <p className='flex justify-between'>
              <span className='text-md font-medium dark:text-gray-200 text-gray-700'>Status:</span>
              <Badge variant={billing.status === 'UNPAID' ? 'destructive' : 'default'}>{billing.status}</Badge></p>
            <Separator />
            <p className='flex justify-between'>
              <span className='text-md font-medium  dark:text-gray-200 text-gray-700'>Payment Mode:</span>
              <span className='text-lg font-bold '>{billing.paymentMode || 'N/A'}</span>
            </p>
          </div>
        )
      case 'REGISTRATION':
        const reg = event.details as RegistrationDetails
        return (
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-md font-medium dark:text-gray-200 text-gray-700">Full Name:</span>
              <span className="text-lg font-bold">{reg.fullName}</span>
            </p>
            <Separator />
            <p className="flex justify-between">
              <span className="text-md font-medium dark:text-gray-200 text-gray-700">Patient Number:</span>
              <span className="text-lg font-bold">{reg.patientNumber}</span>
            </p>
            <Separator />
            <p className="flex justify-between">
              <span className="text-md font-medium dark:text-gray-200 text-gray-700">Registration Fee:</span>
              <span className="text-lg font-bold">${reg.registrationFee.toLocaleString()}</span>
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-3 my-3 shadow-lg bg-transparent">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold">{patient.fullName} - {patient.patientNumber}</CardTitle>
        <p className="text-muted-foreground">Patient Timeline History</p>
      </CardHeader>
      <CardContent className="">
        <ul className="relative space-y-8">
          {sortedTimeline.map((event, index) => (
            <li key={index} className="relative pl-8">
              <div className="absolute left-2 top-0 h-full w-0.5 bg-muted"
                style={{ height: index === sortedTimeline.length - 1 ? '50%' : '100%' }} />
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-4 ring-background border border-primary">
                {getIcon(event.type)}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="font-semibold">{event.type}</Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(new Date(event.date), 'PPP p')}
                  </span>
                </div>
                <div className="p-4 bg-background/50 rounded-lg shadow-sm">
                  {renderDetails(event)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default PatientTimeLineViewClient