'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
}

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Every 8 hours',
      prescribedDate: '2025-11-10',
    },
    {
      id: '2',
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'As needed for pain',
      prescribedDate: '2025-11-10',
    },
  ]);

  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  const addMedication = () => {
    if (newMed.name && newMed.dosage && newMed.frequency) {
      setMedications([
        ...medications,
        {
          id: Date.now().toString(),
          ...newMed,
          prescribedDate: new Date().toISOString().split('T')[0],
        },
      ]);
      setNewMed({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Medication Tracker</h1>
        <p className="text-muted-foreground">
          Track your prescribed medications and dosages
        </p>
      </div>

      {/* Add Medication Form */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Add New Medication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Amoxicillin"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 500mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  placeholder="e.g., Every 8 hours"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={addMedication} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medications List */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle>Current Medications ({medications.length})</CardTitle>
          <CardDescription>Your prescribed medications</CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No medications added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
