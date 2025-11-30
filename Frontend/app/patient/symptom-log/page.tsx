'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SymptomLog {
  id: string;
  date: string;
  symptoms: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export default function SymptomLogPage() {
  const [logs, setLogs] = useState<SymptomLog[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      symptoms: 'Minor redness around surgical site',
      severity: 'mild',
    },
  ]);

  const [newLog, setNewLog] = useState<{ symptoms: string; severity: 'mild' | 'moderate' | 'severe' }>({ symptoms: '', severity: 'mild' });

  const addLog = () => {
    if (newLog.symptoms.trim()) {
      setLogs([
        ...logs,
        {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          symptoms: newLog.symptoms,
          severity: newLog.severity,
        },
      ]);
      setNewLog({ symptoms: '', severity: 'mild' });
    }
  };

  const removeLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Symptom Log</h1>
        <p className="text-muted-foreground">
          Track and record any symptoms during your recovery
        </p>
      </div>

      {/* Add Symptom Form */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Log New Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Describe Your Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe any symptoms you're experiencing..."
                value={newLog.symptoms}
                onChange={(e) => setNewLog({ ...newLog, symptoms: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                value={newLog.severity}
                onChange={(e) =>
                  setNewLog({
                    ...newLog,
                    severity: e.target.value as 'mild' | 'moderate' | 'severe',
                  })
                }
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <Button onClick={addLog} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Log Symptoms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms History */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle>Symptom History ({logs.length})</CardTitle>
          <CardDescription>Your symptom logs</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No symptoms logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">{log.date}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(
                          log.severity
                        )}`}
                      >
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm">{log.symptoms}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLog(log.id)}
                    className="flex-shrink-0"
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
