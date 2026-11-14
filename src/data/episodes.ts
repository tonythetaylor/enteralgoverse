import type { Episode } from '../types/content';

// EDIT CONTENT HERE. Only the first two episodes have filenames.
// Replace an image, add a videoFile and change release to 'released' to publish a future episode.
export const episodes: Episode[] = [
  {
    id: 'the-resume', index: 0, numberLabel: 'PILOT', title: 'The Resume',
    description: 'A job search. Thousands of applications. One very overwhelmed AI.',
    fullDescription: 'ZO is searching for his next opportunity. Inside the digital world, ALGO is drowning in applications and trying to find the right match. Two unlikely perspectives collide in the systems deciding what happens next.',
    image: 'assets/episodes/the-resume.webp', videoFile: 'pilot-the-resume.mp4', release: 'released',
    credits: ['ZO × ALGO', 'A TaylorTheory Multimedia & Design Production'],
  },
  {
    id: 'reconnected', index: 1, numberLabel: 'S01E01', title: 'Reconnected',
    description: 'ZO and ALGO reconnect as their world begins to change.',
    fullDescription: 'After their first connection, ZO and ALGO explore what it means to work together again. A new upgrade creates possibilities that neither fully understands.',
    image: 'assets/episodes/reconnected.webp', videoFile: 's01e01-reconnected.mp4', release: 'released',
    credits: ['ZO × ALGO', 'A TaylorTheory Multimedia & Design Production'],
  },
  ...[2, 3, 4, 5].map((n): Episode => ({
    id: `episode-${n}`, index: n, numberLabel: `S01E${String(n).padStart(2, '0')}`,
    title: 'Untitled Episode', description: 'More from the Algoverse is on the way.',
    fullDescription: 'New stories are being developed. Check back for the next connection.',
    image: n % 2 ? 'assets/worlds/compute-heights.webp' : 'assets/worlds/algoverse.webp',
    videoFile: null, release: 'coming-soon',
  })),
];
export const releasedEpisodes = episodes.filter(e => e.release === 'released');
export const getEpisode = (id: string | undefined) => episodes.find(e => e.id === id);
