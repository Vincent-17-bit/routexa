export const POI_CATEGORIES = [
  { id: 'fire_station', label: 'Fire Stations', color: '#F4511E', maki: 'fire-station', fa: 'fa-fire-extinguisher' },
  { id: 'government', label: 'Government Offices', color: '#5E35B1', maki: 'town-hall', fa: 'fa-building-columns' },
  { id: 'post_office', label: 'Post Offices', color: '#D32F2F', maki: 'post', fa: 'fa-envelope' },
  { id: 'bank', label: 'Banks / ATMs', color: '#0F9D58', maki: 'bank', fa: 'fa-money-bill-wave' },
  { id: 'mall', label: 'Shopping / Malls', color: '#D81B60', maki: 'shop', fa: 'fa-bag-shopping' },
  { id: 'market', label: 'Markets', color: '#EF6C00', maki: 'grocery', fa: 'fa-store' },
  { id: 'hospital', label: 'Hospitals', color: '#E53935', maki: 'hospital', fa: 'fa-hospital' },
  { id: 'pharmacy', label: 'Pharmacies', color: '#00A152', maki: 'pharmacy', fa: 'fa-pills' },
  { id: 'clinic', label: 'Clinics', color: '#F0625F', maki: 'doctor', fa: 'fa-stethoscope' },
  { id: 'hotel', label: 'Hotels / Lodging', color: '#FFB300', maki: 'lodging', fa: 'fa-bed' },
  { id: 'restaurant', label: 'Restaurants', color: '#FB8C00', maki: 'restaurant', fa: 'fa-utensils' },
  { id: 'bus_station', label: 'Bus Stages / Transit', color: '#1E88E5', maki: 'bus', fa: 'fa-bus' },
  { id: 'airport', label: 'Airports', color: '#00ACC1', maki: 'airport', fa: 'fa-plane' },
  { id: 'train_station', label: 'Train Stations', color: '#3949AB', maki: 'rail', fa: 'fa-train' },
  { id: 'gas_station', label: 'Gas Stations', color: '#C62828', maki: 'fuel', fa: 'fa-gas-pump' },
  { id: 'church', label: 'Churches', color: '#8E24AA', maki: 'religious-christian', fa: 'fa-church' },
  { id: 'mosque', label: 'Mosques', color: '#00897B', maki: 'religious-muslim', fa: 'fa-mosque' },
  { id: 'temple', label: 'Temples', color: '#F9A825', maki: 'religious-buddhist', fa: 'fa-gopuram' },
  { id: 'school', label: 'Schools / Academies', color: '#546E7A', maki: 'school', fa: 'fa-graduation-cap' },
  { id: 'university', label: 'Universities', color: '#6A1B9A', maki: 'college', fa: 'fa-landmark' },
  { id: 'library', label: 'Libraries', color: '#6D4C41', maki: 'library', fa: 'fa-book-open' },
  { id: 'museum', label: 'Museums', color: '#8D6E63', maki: 'museum', fa: 'fa-landmark-dome' },
  { id: 'park', label: 'Parks / Gardens', color: '#66BB6A', maki: 'park', fa: 'fa-tree' },
  { id: 'beach', label: 'Beaches', color: '#29B6F6', maki: 'beach', fa: 'fa-umbrella-beach' },
  { id: 'attraction', label: 'Tourist Attractions', color: '#7E57C2', maki: 'monument', fa: 'fa-camera' },
  { id: 'cinema', label: 'Cinemas / Theatres', color: '#C2185B', maki: 'theatre', fa: 'fa-masks-theater' },
  { id: 'industrial', label: 'Factories / Industrial', color: '#616161', maki: 'industry', fa: 'fa-industry' }
]

export const MAKI_TO_CATEGORY = POI_CATEGORIES.reduce((acc, c) => {
  acc[c.maki] = c
  return acc
}, {})

export const KNOWN_MAKI_IDS = Object.keys(MAKI_TO_CATEGORY)
