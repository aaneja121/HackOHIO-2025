'use client'

import { DailyChecklist } from '@/components/patient/DailyChecklist';
import { RiskScoreDisplay } from '@/components/patient/RiskScoreDisplay';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <RiskScoreDisplay score={15} status="Healthy" />
      
      <DailyChecklist />

      <Link href="/patient/wound_check" passHref>
        <Button className="w-full text-lg p-6">
          Start Your Daily Wound Check
        </Button>
      </Link>
    </div>
  );
}