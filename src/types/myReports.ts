export interface MyReportItem {
  reportId: string;
  itemId: string;
  referenceNumber?: string;
  type: "lost" | "found";
  name: string;
  category: string;
  building?: string;
  location: string;
  dateReported: string;
  imageUrl?: string;
  itemStatus: string;
  reviewStatus: string;
  submittedAt: string;
}
