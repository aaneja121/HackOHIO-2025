import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export const DailyChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'wound-check', label: 'Check wound for redness or swelling', completed: false },
    { id: 'clean-wound', label: 'Clean and dress wound as instructed', completed: false },
    { id: 'pain-level', label: 'Log pain level (1-10)', completed: false },
    { id: 'medication', label: 'Take prescribed medications', completed: false },
    { id: 'movement', label: 'Complete prescribed exercises', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / items.length) * 100);

  return (
    <Card className="border-0 bg-white shadow-sm dark:bg-gray-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Daily Checklist</CardTitle>
          </div>
          <Badge variant="outline">{completionPercentage}% Complete</Badge>
        </div>
        <CardDescription>Complete your daily recovery tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="h-5 w-5"
              />
              <label
                htmlFor={item.id}
                className={`flex-1 cursor-pointer text-sm ${
                  item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.label}
              </label>
              {item.completed && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
