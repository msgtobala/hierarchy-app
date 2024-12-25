export interface Level {
  id: string;
  name: string;
  isVerified: boolean;
  image: string;
  parentIds: string[];
  level: number;  // Indicates L1, L2, L3, etc.
}
