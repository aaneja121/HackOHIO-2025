import { DailyChecklist } from '@/components/patient/DailyChecklist';
import { RiskScoreDisplay } from '@/components/patient/RiskScoreDisplay';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This is the main "home" screen for the patient.
// It shows the core loop: the checklist and the risk score.
export default function PatientDashboard() {
  return (
    <div className="p-4 space-y-6">
      <RiskScoreDisplay score={15} status="Healthy" />
      
      {/* The hard-coded checklist from your demo spec */}
      <DailyChecklist />

      {/* This is the main "Call to Action" that links to your "wow" demo */}
      <Link href="/wound-check" passHref>
        <Button className="w-full text-lg p-6">
          Start Your Daily Wound Check
        </Button>
      </Link>
    </div>
  );
}