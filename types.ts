export enum ProjectType {
  LOGO = 'LOGO',
  PACKAGE = 'PACKAGE',
  ADS = 'ADS',
  WEBSITE = 'WEBSITE',
  POSTER = 'POSTER'
}

export interface Step {
  id: string;
  label: string;
}

export interface ProjectData {
  clientName: string;
  projectName: string;
  type: ProjectType;
  completedSteps: string[];
  progress: number;
  customNotes: string;
  aiUpdateText: string;
  companyLogo: string | null;
  workingTime: string;
  projectHandler: string;
  designer: string;
  deadline: string;
  isDelayed: boolean;
  delayReason: string;
}

export const PROJECT_HANDLERS = [
  { name: 'Sumana Saha', designation: 'Social Media Marketing Manager' },
  { name: 'Sukanya Chowdhury', designation: 'Project Manager' },
  { name: 'Somnath Chowdhury', designation: 'Senior Graphic Designer' }
];

export const DESIGNERS = [
  'Somnath Chowdhury',
  'Sumana Saha',
  'Sukanya Chowdhury',
  'Design Team'
];

export const PROJECT_TYPES: Record<ProjectType, { label: string; icon: string; steps: Step[] }> = {
  [ProjectType.LOGO]: {
    label: 'Logo Design',
    icon: 'PenTool',
    steps: [
      { id: 'brief', label: 'Brief & Research' },
      { id: 'sketch', label: 'Sketching Concepts' },
      { id: 'vector', label: 'Vectorizing' },
      { id: 'color', label: 'Color Palette Selection' },
      { id: 'polish', label: 'Final Polish & Formats' },
    ]
  },
  [ProjectType.PACKAGE]: {
    label: 'Branding Package',
    icon: 'Package',
    steps: [
      { id: 'logo', label: 'Logo Design' },
      { id: 'poster', label: 'Poster Design' },
      { id: 'letterhead', label: 'Letterhead' },
      { id: 'visiting_card', label: 'Visiting Card' },
      { id: 'intro_video', label: 'Intro Video' },
    ]
  },
  [ProjectType.ADS]: {
    label: 'Ads Video',
    icon: 'Video',
    steps: [
      { id: 'script', label: 'Scriptwriting' },
      { id: 'storyboard', label: 'Storyboard' },
      { id: 'production', label: 'Animation / Filming' },
      { id: 'voiceover', label: 'Voiceover & Sound' },
      { id: 'editing', label: 'Editing & Effects' },
      { id: 'render', label: 'Final Render' },
    ]
  },
  [ProjectType.WEBSITE]: {
    label: 'Website Design',
    icon: 'Globe',
    steps: [
      { id: 'sitemap', label: 'Sitemap & Wireframe' },
      { id: 'ui_design', label: 'UI/UX Design' },
      { id: 'development', label: 'Development (Code/CMS)' },
      { id: 'content', label: 'Content Upload' },
      { id: 'testing', label: 'Testing & QA' },
      { id: 'launch', label: 'Live Launch' },
    ]
  },
  [ProjectType.POSTER]: {
    label: 'Poster Design',
    icon: 'Image',
    steps: [
      { id: 'concept', label: 'Concept & Copy' },
      { id: 'layout', label: 'Layout Draft' },
      { id: 'revision', label: 'Design Revisions' },
      { id: 'final', label: 'Print Ready File' },
    ]
  }
};