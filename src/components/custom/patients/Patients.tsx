'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status?: 'active' | 'inactive';
}

interface PatientsClientProps {
  patients: Patient[];
}

const PatientsClient: React.FC<PatientsClientProps> = ({ patients = [] }) => {
  const [search, setSearch] = useState('');
  const filteredPatients = (patients || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Patients
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search patients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(p => (
          <Card key={p.id} className="shadow-lg rounded-xl">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              {p.status && (
                <Badge
                  variant={p.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {p.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Age: {p.age}</p>
              <p>Gender: {p.gender}</p>
              <Button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientsClient;
