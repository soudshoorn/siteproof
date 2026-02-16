import type {
  User,
  Organization,
  OrganizationMember,
  Website,
  Scan,
  PageResult,
  Issue,
  ScanSchedule,
  BlogPost,
  SeoPage,
  PlanType,
  ScanStatus,
  IssueSeverity,
  IssueImpact,
  Role,
  ScheduleFrequency,
  PostStatus,
} from "@prisma/client";

export type {
  User,
  Organization,
  OrganizationMember,
  Website,
  Scan,
  PageResult,
  Issue,
  ScanSchedule,
  BlogPost,
  SeoPage,
  PlanType,
  ScanStatus,
  IssueSeverity,
  IssueImpact,
  Role,
  ScheduleFrequency,
  PostStatus,
};

export type WebsiteWithScans = Website & {
  scans: Scan[];
};

export type ScanWithRelations = Scan & {
  website: Website;
  pages: PageResult[];
  issues: Issue[];
  startedBy: User | null;
};

export type OrganizationWithMembers = Organization & {
  members: (OrganizationMember & { user: User })[];
  websites: Website[];
};

export type IssueWithPage = Issue & {
  pageResult: PageResult | null;
};

export interface QuickScanResult {
  id: string;
  url: string;
  score: number;
  totalIssues: number;
  issues: {
    severity: IssueSeverity;
    description: string;
    helpText: string;
    fixSuggestion: string;
    wcagCriteria: string[];
    htmlElement: string | null;
    cssSelector: string | null;
  }[];
  eaaCompliant: boolean;
  scannedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
