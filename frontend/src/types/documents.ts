export type DocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'verified'
  | 'rejected';

export type DocumentType =
  | 'drivingLicense'
  | 'aadhaar'
  | 'pan'
  | 'rc'
  | 'insurance'
  | 'pollution';

export interface DocumentData {
  id: DocumentType;
  title: string;
  subtitle: string;
  uri?: string;
  status: DocumentStatus;
}