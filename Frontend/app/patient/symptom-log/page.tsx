'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const DEMO_USER_ID = 'demo_user_001';

export default function SymptomLogPage() {
  const queryClient = useQueryClient();
  const [newLog, setNewLog] = useState<{ symptoms: string; severity: 'mild' | 'moderate' | 'severe' }>({
    symptoms: '',
    severity: 'mild'
  });

  // 1. Ensure Demo User Exists
  useEffect(() => {
    api.createUser(DEMO_USER_ID, 'Demo Patient')
      .catch(err => console.error("Error ensuring demo user:", err));
  }, []);

  // 2. Fetch Logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['symptom-logs', DEMO_USER_ID],
    queryFn: () => api.getLogs(DEMO_USER_ID),
  });

  // 3. Add Log Mutation
  const addLogMutation = useMutation({
    mutationFn: (data: { text: string; urgency: number }) =>
      api.createLog(DEMO_USER_ID, data.text, data.urgency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptom-logs'] });
      setNewLog({ symptoms: '', severity: 'mild' });
    }
  });

  const handleAddLog = () => {
    if (newLog.symptoms.trim()) {
      // Map severity to simpler urgency number for backend
      const urgencyMap = { 'mild': 1.0, 'moderate': 5.0, 'severe': 10.0 };
      addLogMutation.mutate({
        text: newLog.symptoms,
        urgency: urgencyMap[newLog.severity]
      });
    }
  };

  const getSeverityLabel = (urgency: number) => {
    if (urgency >= 8) return 'severe';
    if (urgency >= 4) return 'moderate';
    return 'mild';
  };

  const getSeverityColor = (urgency: number) => {
    if (urgency >= 8) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (urgency >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Symptom Log</h1>
        <p className="text-muted-foreground">
          Track and record any symptoms during your recovery (Connected to DB)
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
            <Button onClick={handleAddLog} className="w-full" disabled={addLogMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {addLogMutation.isPending ? 'Saving...' : 'Log Symptoms'}
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
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading history...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No symptoms logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(
                          log.urgency
                        )}`}
                      >
                        {getSeverityLabel(log.urgency).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm">{log.free_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
