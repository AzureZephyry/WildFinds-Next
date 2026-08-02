import ReportSubmissionScreen from "@/features/reports/submission/components/ReportSubmissionScreen";

export default function ReportLostPage() {
  return (
    <ReportSubmissionScreen
      reportType="lost"
      heading="Share the details of something you misplaced"
      description="Submit a report so campus staff or other students can help identify and return it."
      successExplanation="Keep an eye on your report and check the home page for matching found-item submissions."
    />
  );
}
