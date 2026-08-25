import type { GuideContent, GuideSection } from './content-types';

type LegacyGuideSection = {
  heading: string;
  content: string;
  subsections?: { subheading: string; content: string }[];
};

export type LegacyGuide = {
  title: string;
  metaDescription?: string;
  lastUpdated?: string;
  sections: LegacyGuideSection[];
};

function flattenSection(section: LegacyGuideSection): GuideSection {
  const subsections = (section.subsections ?? [])
    .map(({ subheading, content }) => `\n\n${subheading}\n${content}`)
    .join('');

  return { heading: section.heading, content: `${section.content}${subsections}` };
}

export function guideFromLegacy(page: LegacyGuide): GuideContent {
  return {
    title: page.title,
    description: page.metaDescription ?? page.lastUpdated ?? page.title,
    directAnswer: page.lastUpdated ?? page.metaDescription ?? page.title,
    sections: page.sections.map(flattenSection),
  };
}
