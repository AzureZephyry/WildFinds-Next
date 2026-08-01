// Legacy mock item shape retained for the claim/match prototype only.
export interface LegacyMockItem {
  id: string;
  name: string;
  type: "lost" | "found";
  category: string;
  location: string;
  dateReported: string;
  status: string;
  referenceNumber: string;
  building: string;
  description: string;
  brand: string;
  color: string;
  identifyingMarks: string;
  imageUrl: string;
  timeReported?: string;
}
