import type {
  ArchivedVideoInfo,
  VideoSchema,
} from '~/server/api/types/videoTypes'

export const MockAddedVideos = [
  {
    videoId: 'tszI9GrH1u0',
    title: 'I built a react app… but with a visual',
    thumbnail: 'https://i.ytimg.com/vi/tszI9GrH1u0/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=tszI9GrH1u0',
    videoOwnerChannelTitle: 'Fireship',
    duration: '22:22',
  },
  {
    videoId: 'Wqy3PBEglXQ',
    title: 'PocketBase... The Ultimate Side-Hustle Backend?',
    thumbnail: 'https://i.ytimg.com/vi/Wqy3PBEglXQ/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=Wqy3PBEglXQ',
    videoOwnerChannelTitle: 'Fireship',
    duration: '22:02',
  },
  {
    videoId: 'GVwU_nZBDmM',
    title: 'Last Training Before World Climbing Championships by Adam Ondra',
    thumbnail: 'https://i.ytimg.com/vi/GVwU_nZBDmM/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=GVwU_nZBDmM',
    videoOwnerChannelTitle: 'Adam Ondra',
    duration: '13:23',
  },
] as VideoSchema[]

export const MockDeletedVideos = [
  {
    author_name: 'Fireship',
    author_url: 'https://www.youtube.com/@Fireship',
    height: 200,
    width: 480,
    thumbnail_url: 'https://i.ytimg.com/vi/tszI9GrH1u0/hqdefault.jpg',
    title: 'I built a react app… but with a visual',
    url: 'https://www.youtube.com/watch?v=tszI9GrH1u0',
  },
  {
    author_name: 'Fireship',
    author_url: 'https://www.youtube.com/@Fireship',
    height: 200,
    width: 480,
    thumbnail_url: 'https://i.ytimg.com/vi/Wqy3PBEglXQ/hqdefault.jpg',
    title: 'PocketBase... The Ultimate Side-Hustle Backend?',
    url: 'https://www.youtube.com/watch?v=Wqy3PBEglXQ',
  },
] as ArchivedVideoInfo[]
