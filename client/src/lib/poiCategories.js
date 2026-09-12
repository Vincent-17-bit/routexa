export const POI_CATEGORIES = [
  { id: 'fire_station', label: 'Fire Stations', color: '#F4511E', maki: 'fire-station' },
  { id: 'government', label: 'Government Offices', color: '#5E35B1', maki: 'town-hall' },
  { id: 'courthouse', label: 'Courthouses', color: '#283593', maki: null },
  { id: 'post_office', label: 'Post Offices', color: '#D32F2F', maki: 'post' },
  { id: 'community_center', label: 'Community Centers', color: '#26A69A', maki: null },

  { id: 'bank', label: 'Banks / ATMs', color: '#0F9D58', maki: 'bank' },
  { id: 'mall', label: 'Shopping / Malls', color: '#D81B60', maki: 'shop' },
  { id: 'market', label: 'Markets', color: '#EF6C00', maki: 'grocery' },
  { id: 'courier', label: 'Couriers / Delivery', color: '#FF7043', maki: null },

  { id: 'hospital', label: 'Hospitals', color: '#E53935', maki: 'hospital' },
  { id: 'pharmacy', label: 'Pharmacies', color: '#00A152', maki: 'pharmacy' },
  { id: 'clinic', label: 'Clinics', color: '#F0625F', maki: 'doctor' },

  { id: 'hotel', label: 'Hotels / Lodging', color: '#FFB300', maki: 'lodging' },
  { id: 'restaurant', label: 'Restaurants', color: '#FB8C00', maki: 'restaurant' },

  { id: 'bus_station', label: 'Bus Stages / Transit', color: '#1E88E5', maki: 'bus' },
  { id: 'airport', label: 'Airports', color: '#00ACC1', maki: 'airport' },
  { id: 'train_station', label: 'Train Stations', color: '#3949AB', maki: 'rail' },
  { id: 'taxi', label: 'Taxi Stands', color: '#FDD835', maki: null },
  { id: 'parking', label: 'Parking', color: '#546E7A', maki: 'parking' },
  { id: 'gas_station', label: 'Gas Stations', color: '#C62828', maki: 'fuel' },

  { id: 'church', label: 'Churches', color: '#8E24AA', maki: 'religious-christian' },
  { id: 'mosque', label: 'Mosques', color: '#00897B', maki: 'religious-muslim' },
  { id: 'temple', label: 'Temples', color: '#F9A825', maki: 'religious-buddhist' },

  { id: 'school', label: 'Schools / Academies', color: '#546E7A', maki: 'school' },
  { id: 'university', label: 'Universities', color: '#6A1B9A', maki: 'college' },
  { id: 'library', label: 'Libraries', color: '#6D4C41', maki: 'library' },
  { id: 'museum', label: 'Museums', color: '#8D6E63', maki: 'museum' },

  { id: 'park', label: 'Parks / Gardens', color: '#66BB6A', maki: 'park' },
  { id: 'beach', label: 'Beaches', color: '#29B6F6', maki: 'beach' },
  { id: 'attraction', label: 'Tourist Attractions', color: '#7E57C2', maki: 'monument' },
  { id: 'cinema', label: 'Cinemas / Theatres', color: '#C2185B', maki: 'theatre' },

  { id: 'construction', label: 'Construction Sites', color: '#FF8F00', maki: null },
  { id: 'industrial', label: 'Factories / Industrial', color: '#616161', maki: 'industry' },
  { id: 'cemetery', label: 'Cemeteries', color: '#757575', maki: 'cemetery' },
  { id: 'toilet', label: 'Public Toilets', color: '#607D8B', maki: 'toilet' },
  { id: 'water_point', label: 'Water Points', color: '#039BE5', maki: 'water' },
  { id: 'utility', label: 'Electricity / Utilities', color: '#FBC02D', maki: null },
  { id: 'recycling', label: 'Recycling / Waste', color: '#2E7D32', maki: 'recycling' }
]

export const MAKI_COLOR_MAP = POI_CATEGORIES.filter((c) => c.maki).reduce((acc, c) => {
  acc[c.maki] = c.color
  return acc
}, {})

export const KNOWN_MAKI_IDS = new Set(Object.keys(MAKI_COLOR_MAP))

export function buildMakiMatchExpression(defaultColor) {
  const expr = ['match', ['get', 'maki']]
  for (const [maki, color] of Object.entries(MAKI_COLOR_MAP)) {
    expr.push(maki, color)
  }
  expr.push(defaultColor)
  return expr
}
