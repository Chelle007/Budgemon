import Page from '../page';

// Reuse the main app logic but force sleepMode so the companion uses CompanionSleepView
export default function SleepPage() {
  return <Page sleepMode />;
}


