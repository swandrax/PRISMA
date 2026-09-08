export type ContributionCategory = 'KEAMANAN' | 'KEBERSIHAN' | 'SOSIAL' | 'INFRASTRUKTUR';

export type BillingStatus = 'UNPAID' | 'PAID' | 'OVERDUE';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Contribution {
  id: string;
  name: string;
  kategori: string;
  amount: number;
  periode: string;
  isActive: boolean;
}

export interface ContributionBill {
  id: string;
  contributionId: string;
  contributionName: string;
  kategori: string;
  wargaId: string;
  wargaNama?: string;
  bulan: number;
  tahun: number;
  amount: number;
  status: BillingStatus;
  dueDate: string | Date;
  payment?: {
    id: string;
    amount: number;
    paymentMethod: string;
    buktiBayarUrl?: string | null;
    status: PaymentStatus;
    verifiedAt?: string | Date | null;
  };
}

export interface MonthlyContributionSummary {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  collectionRatePercent: number;
  periodLabel: string;
}
