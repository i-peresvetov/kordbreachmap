export type MapId =
  | 'customs'
  | 'factory'
  | 'ground-zero'
  | 'interchange'
  | 'lighthouse'
  | 'reserve'
  | 'shoreline'
  | 'streets'
  | 'terminal'
  | 'the-lab'
  | 'the-labyrinth'
  | 'woods'

export type TarkovMap = {
  id: MapId
  name: string
  /** Local path under public/ */
  image: string
  /** Pixel width (wiki mapBounds max X) */
  width: number
  /** Pixel height (wiki mapBounds max Y) */
  height: number
}

/** Bounds and names match Fandom Interactive Maps (origin: bottom-left). */
export const MAPS: TarkovMap[] = [
  {
    id: 'customs',
    name: 'Таможня',
    image: '/maps/customs.png',
    width: 4097,
    height: 2142,
  },
  {
    id: 'factory',
    name: 'Завод',
    image: '/maps/factory.jpg',
    width: 13440,
    height: 6656,
  },
  {
    id: 'ground-zero',
    name: 'Эпицентр',
    image: '/maps/ground-zero.png',
    width: 6920,
    height: 6920,
  },
  {
    id: 'interchange',
    name: 'Развязка',
    image: '/maps/interchange.webp',
    width: 9600,
    height: 5400,
  },
  {
    id: 'lighthouse',
    name: 'Маяк',
    image: '/maps/lighthouse.png',
    width: 2242,
    height: 3892,
  },
  {
    id: 'reserve',
    name: 'Резерв',
    image: '/maps/reserve.png',
    width: 4701,
    height: 2785,
  },
  {
    id: 'shoreline',
    name: 'Берег',
    image: '/maps/shoreline.png',
    width: 6668,
    height: 4567,
  },
  {
    id: 'streets',
    name: 'Улицы Таркова',
    image: '/maps/streets.png',
    width: 7620,
    height: 5877,
  },
  {
    id: 'terminal',
    name: 'Ледокол',
    image: '/maps/terminal.png',
    width: 11520,
    height: 6480,
  },
  {
    id: 'the-lab',
    name: 'Лаборатория',
    image: '/maps/the-lab.png',
    width: 3820,
    height: 2189,
  },
  {
    id: 'the-labyrinth',
    name: 'Лабиринт',
    image: '/maps/the-labyrinth.png',
    width: 4145,
    height: 3840,
  },
  {
    id: 'woods',
    name: 'Лес',
    image: '/maps/woods.png',
    width: 6994,
    height: 6843,
  },
]

export function getMapById(id: MapId): TarkovMap {
  const map = MAPS.find((m) => m.id === id)
  if (!map) throw new Error(`Unknown map: ${id}`)
  return map
}
