export interface Talk {
  title: string;
  event: string;
  location: string;
  year: number;
  url: string;
  /** Session chairing, panels, or other roles beyond the talk itself. */
  note?: string;
}

export const talks: Talk[] = [
  {
    title: 'Evaluation of Road Segmentation Techniques on Visible and Infrared Low-Altitude UAS Imagery',
    event: 'IEEE International Geoscience and Remote Sensing Symposium (IGARSS)',
    location: 'Kuala Lumpur, Malaysia',
    year: 2022,
    url: 'https://www.igarss2022.org/view_session.php?SessionID=1050',
    note: 'Also chaired the session "Image Feature Estimation Techniques" (TU2.MMA).',
  },
];
