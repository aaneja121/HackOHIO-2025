'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TherapySession {
  id: string;
  type: string;
  duration: number;
  date: string;
  notes: string;
}

export default function TherapyPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([
    {
      id: '1',
      type: 'Physical Therapy',
      duration: 30,
      date: new Date().toISOString().split('T')[0],
      notes: 'Range of motion exercises',
    },
  ]);

  const [newSession, setNewSession] = useState({
    type: 'Physical Therapy',
    duration: '',
    notes: '',
  });

  const addSession = () => {
    if (newSession.type && newSession.duration) {
      setSessions([
        ...sessions,
        {
          id: Date.now().toString(),
          type: newSession.type,
          duration: parseInt(newSession.duration),
          date: new Date().toISOString().split('T')[0],
          notes: newSession.notes,
        },
      ]);
      setNewSession({ type: 'Physical Therapy', duration: '', notes: '' });
    }
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Therapy Sessions</h1>
        <p className="text-muted-foreground">
          Track your physical and occupational therapy sessions
        </p>
      </div>

      {/* Add Session Form */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Log Therapy Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Therapy Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={newSession.type}
                  onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                >
                  <option value="Physical Therapy">Physical Therapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                  <option value="Speech Therapy">Speech Therapy</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 30"
                  value={newSession.duration}
                  onChange={(e) =>
                    setNewSession({ ...newSession, duration: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="What exercises or treatments did you do?"
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
              />
            </div>
            <Button onClick={addSession} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Log Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions History */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle>Therapy Sessions ({sessions.length})</CardTitle>
          <CardDescription>Your therapy session history</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No therapy sessions logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{session.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.duration} min • {session.date}
                    </p>
                    {session.notes && (
                      <p className="text-sm mt-1">{session.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSession(session.id)}
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
