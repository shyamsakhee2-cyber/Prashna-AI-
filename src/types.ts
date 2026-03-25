export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde?: boolean;
}

export interface PrashnaData {
  question: string;
  dateTime: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  kpNumber?: number;
  language: string;
}

export interface PredictionResult {
  summary: string;
  planetaryPositions: Planet[];
  detailedAnalysis: string;
  timingOfEvent: string;
  remedies: string;
  lagnaRashi: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
}

export interface PrashnaHistory {
  id: string;
  uid: string;
  data: PrashnaData;
  result: PredictionResult;
  createdAt: any;
}
