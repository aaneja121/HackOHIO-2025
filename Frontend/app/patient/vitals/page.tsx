'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface VitalReading {
  id: string;
  type: 'heart-rate' | 'blood-pressure' | 'temperature' | 'oxygen';
  value: string;
  unit: string;
  timestamp: string;
}

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalReading[]>([
    {
      id: '1',
      type: 'heart-rate',
      value: '72',
      unit: 'bpm',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'temperature',
      value: '98.6',
      unit: '°F',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [newVital, setNewVital] = useState<{ type: 'heart-rate' | 'blood-pressure' | 'temperature' | 'oxygen'; value: string }>({ type: 'heart-rate', value: '' });

  const getUnitForType = (type: string) => {
    switch (type) {
      case 'heart-rate':
        return 'bpm';
      case 'blood-pressure':
        return 'mmHg';
      case 'temperature':
        return '°F';
      case 'oxygen':
        return '%';
      default:
        return '';
    }
  };

  const addVital = () => {
    if (newVital.value) {
      setVitals([
        ...vitals,
        {
          id: Date.now().toString(),
          type: newVital.type,
          value: newVital.value,
          unit: getUnitForType(newVital.type),
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewVital({ type: 'heart-rate', value: '' });
    }
  };

  const removeVital = (id: string) => {
    setVitals(vitals.filter((v) => v.id !== id));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'heart-rate':
        return 'Heart Rate';
      case 'blood-pressure':
        return 'Blood Pressure';
      case 'temperature':
        return 'Temperature';
      case 'oxygen':
        return 'Oxygen Level';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vital Signs</h1>
        <p className="text-muted-foreground">
          Track your vital signs during recovery
        </p>
      </div>

      {/* Add Vital Form */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Record New Vital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Vital Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={newVital.type}
                  onChange={(e) =>
                    setNewVital({
                      ...newVital,
                      type: e.target.value as
                        | 'heart-rate'
                        | 'blood-pressure'
                        | 'temperature'
                        | 'oxygen',
                    })
                  }
                >
                  <option value="heart-rate">Heart Rate</option>
                  <option value="blood-pressure">Blood Pressure</option>
                  <option value="temperature">Temperature</option>
                  <option value="oxygen">Oxygen Level</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Enter value"
                  value={newVital.value}
                  onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <div className="px-3 py-2 rounded-md border border-input bg-muted">
                  {getUnitForType(newVital.type)}
                </div>
              </div>
            </div>
            <Button onClick={addVital} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Record Vital
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vitals History */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle>Vital Signs History</CardTitle>
          <CardDescription>Your recorded vital signs</CardDescription>
        </CardHeader>
        <CardContent>
          {vitals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No vitals recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {vitals.map((vital) => (
                <div
                  key={vital.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{getTypeLabel(vital.type)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(vital.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right pr-4">
                    <p className="text-2xl font-bold">
                      {vital.value}
                      <span className="text-sm text-muted-foreground ml-1">
                        {vital.unit}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVital(vital.id)}
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
