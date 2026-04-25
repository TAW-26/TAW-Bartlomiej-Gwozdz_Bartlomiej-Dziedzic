export type EventItem = {
  id: string;
  title: string;
  categories: string;
  city: string;
  location: string;
  startAt: string;
  endAt: string;
  status: string;
  description: string;
};

export const EVENTS: EventItem[] = [
  {
    id: '1',
    title: 'NAME',
    categories: 'Category1, category2',
    city: 'city',
    location: 'location',
    startAt: 'start at:',
    endAt: 'end at:',
    status: 'status:',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
  },
  {
    id: '2',
    title: 'NAME',
    categories: 'Category1, category2',
    city: 'city',
    location: 'location',
    startAt: 'start at:',
    endAt: 'end at:',
    status: 'status:',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
  },
  {
    id: '3',
    title: 'NAME',
    categories: 'Category1, category2',
    city: 'city',
    location: 'location',
    startAt: 'start at:',
    endAt: 'end at:',
    status: 'status:',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
  },
];
