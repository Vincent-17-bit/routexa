const RED = '#EA4335'
const PINK = '#E91E8C'
const ORANGE = '#FB8C00'
const BLUE = '#4285F4'
const PURPLE = '#9C27B0'
const GRAY = '#78909C'
const GREEN = '#0F9D58'

export const POI_CATEGORIES = [
  { id: 'fire_station', label: 'Fire Stations', color: RED, maki: 'fire-station', fa: 'fa-fire-extinguisher' },
  { id: 'government', label: 'Government Offices', color: PURPLE, maki: 'town-hall', fa: 'fa-building-columns' },
  { id: 'post_office', label: 'Post Offices', color: RED, maki: 'post', fa: 'fa-envelope' },
  { id: 'bank', label: 'Banks / ATMs', color: BLUE, maki: 'bank', fa: 'fa-money-bill-wave' },
  { id: 'mall', label: 'Shopping / Malls', color: BLUE, maki: 'shop', fa: 'fa-bag-shopping' },
  { id: 'market', label: 'Markets', color: BLUE, maki: 'grocery', fa: 'fa-store' },
  { id: 'hospital', label: 'Hospitals', color: RED, maki: 'hospital', fa: 'fa-hospital' },
  { id: 'pharmacy', label: 'Pharmacies', color: RED, maki: 'pharmacy', fa: 'fa-pills' },
  { id: 'clinic', label: 'Clinics', color: RED, maki: 'doctor', fa: 'fa-stethoscope' },
  { id: 'hotel', label: 'Hotels / Lodging', color: PINK, maki: 'lodging', fa: 'fa-bed' },
  { id: 'restaurant', label: 'Restaurants', color: ORANGE, maki: 'restaurant', fa: 'fa-utensils' },
  { id: 'bus_station', label: 'Bus Stages / Transit', color: PURPLE, maki: 'bus', fa: 'fa-bus' },
  { id: 'airport', label: 'Airports', color: BLUE, maki: 'airport', fa: 'fa-plane' },
  { id: 'train_station', label: 'Train Stations', color: BLUE, maki: 'rail', fa: 'fa-train' },
  { id: 'gas_station', label: 'Gas Stations', color: BLUE, maki: 'fuel', fa: 'fa-gas-pump' },
  { id: 'church', label: 'Churches', color: GRAY, maki: 'religious-christian', fa: 'fa-church' },
  { id: 'mosque', label: 'Mosques', color: GRAY, maki: 'religious-muslim', fa: 'fa-mosque' },
  { id: 'temple', label: 'Temples', color: GRAY, maki: 'religious-buddhist', fa: 'fa-gopuram' },
  { id: 'school', label: 'Schools / Academies', color: GRAY, maki: 'school', fa: 'fa-graduation-cap' },
  { id: 'university', label: 'Universities', color: GRAY, maki: 'college', fa: 'fa-landmark' },
  { id: 'library', label: 'Libraries', color: GRAY, maki: 'library', fa: 'fa-book-open' },
  { id: 'museum', label: 'Museums', color: PURPLE, maki: 'museum', fa: 'fa-landmark-dome' },
  { id: 'park', label: 'Parks / Gardens', color: GREEN, maki: 'park', fa: 'fa-tree' },
  { id: 'beach', label: 'Beaches', color: BLUE, maki: 'beach', fa: 'fa-umbrella-beach' },
  { id: 'attraction', label: 'Tourist Attractions', color: PURPLE, maki: 'monument', fa: 'fa-camera' },
  { id: 'cinema', label: 'Cinemas / Theatres', color: PURPLE, maki: 'theatre', fa: 'fa-masks-theater' },
  { id: 'industrial', label: 'Factories / Industrial', color: GRAY, maki: 'industry', fa: 'fa-industry' }
]

export const MAKI_TO_CATEGORY = POI_CATEGORIES.reduce((acc, c) => {
  acc[c.maki] = c
  return acc
}, {})

export const KNOWN_MAKI_IDS = Object.keys(MAKI_TO_CATEGORY)
