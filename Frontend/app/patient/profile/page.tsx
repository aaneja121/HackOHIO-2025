'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  surgeryDate: string;
  surgeryType: string;
  surgeon: string;
  emergencyContact: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    surgeryDate: '2025-11-05',
    surgeryType: 'Knee Surgery',
    surgeon: 'Dr. Smith',
    emergencyContact: '(555) 987-6543',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal and medical information
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              Personal Information
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-lg font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-lg font-medium">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="text-lg font-medium">{profile.emergencyContact}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={editedProfile.emergencyContact}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Information Card */}
      <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>Your surgery and care details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Surgery Type</p>
                <p className="text-lg font-medium">{profile.surgeryType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Surgery Date</p>
                <p className="text-lg font-medium">
                  {new Date(profile.surgeryDate).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Surgeon</p>
                <p className="text-lg font-medium">{profile.surgeon}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
