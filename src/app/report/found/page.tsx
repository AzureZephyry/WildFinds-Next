import ReportSubmissionScreen from "@/features/reports/submission/components/ReportSubmissionScreen";

export default function ReportFoundPage() {
  return (
    <ReportSubmissionScreen
      reportType="found"
      heading="Share the details of an item you found on campus"
      description="Submit a report so the owner can recognize and claim it quickly."
      successExplanation="Your report will appear in the listings so it can be matched with a lost-item report."
    />
  );
}
