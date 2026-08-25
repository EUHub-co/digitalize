export type Citation = {
  id: string;
  label: string;
  url: string;
  publisher: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type DecisionTable = {
  caption: string;
  columns: string[];
  rows: string[][];
};

export type GuideSection = {
  heading: string;
  content: string;
  table?: DecisionTable;
};

export type GuideContent = {
  title: string;
  description: string;
  directAnswer: string;
  updatedOn?: string;
  sections: GuideSection[];
  faqs?: FaqItem[];
  citations?: Citation[];
};
