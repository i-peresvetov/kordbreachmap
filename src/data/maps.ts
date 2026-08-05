import { assetUrl } from '../lib/assetUrl'

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
  /** URL under public/ (with Vite base) */
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
    image: assetUrl('maps/customs.png'),
    width: 4097,
    height: 2142,
  },
  {
    id: 'factory',
    name: 'Завод',
    image: assetUrl('maps/factory.jpg'),
    width: 13440,
    height: 6656,
  },
  {
    id: 'ground-zero',
    name: 'Эпицентр',
    image: assetUrl('maps/ground-zero.png'),
    width: 6920,
    height: 6920,
  },
  {
    id: 'interchange',
    name: 'Развязка',
    image: assetUrl('maps/interchange.webp'),
    width: 9600,
    height: 5400,
  },
  {
    id: 'lighthouse',
    name: 'Маяк',
    image: assetUrl('maps/lighthouse.png'),
    width: 2242,
    height: 3892,
  },
  {
    id: 'reserve',
    name: 'Резерв',
    image: assetUrl('maps/reserve.png'),
    width: 4701,
    height: 2785,
  },
  {
    id: 'shoreline',
    name: 'Берег',
    image: assetUrl('maps/shoreline.png'),
    width: 6668,
    height: 4567,
  },
  {
    id: 'streets',
    name: 'Улицы Таркова',
    image: assetUrl('maps/streets.png'),
    width: 7620,
    height: 5877,
  },
  {
    id: 'terminal',
    name: 'Ледокол',
    image: assetUrl('maps/terminal.svg'),
    width: 1600,
    height: 900,
  },
  {
    id: 'the-lab',
    name: 'Лаборатория',
    image: assetUrl('maps/the-lab.png'),
    width: 3820,
    height: 2189,
  },
  {
    id: 'the-labyrinth',
    name: 'Лабиринт',
    image: assetUrl('maps/the-labyrinth.png'),
    width: 4145,
    height: 3840,
  },
  {
    id: 'woods',
    name: 'Лес',
    image: assetUrl('maps/woods.png'),
    width: 6994,
    height: 6843,
  },
]

export function getMapById(id: MapId): TarkovMap {
  const map = MAPS.find((m) => m.id === id)
  if (!map) throw new Error(`Unknown map: ${id}`)
  return map
}
