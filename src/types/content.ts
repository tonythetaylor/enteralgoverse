export type Episode = {
  id: string;
  index: number;
  numberLabel: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  videoFile: string | null;
  duration?: string;
  release: 'released' | 'coming-soon';
  credits?: string[];
  captionsFile?: string;
};

export type Character = {
  id: string;
  name: string;
  subtitle: string;
  role: string;
  description: string;
  personality: string;
  quote: string;
  image: string;
  sheet: string;
  color: string;
  group: 'Human world' | 'Digital world';
};

export type World = { id: string; title: string; eyebrow: string; description: string; image: string };
