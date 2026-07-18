/* Canonical geography for tag filtering on news and media.
 * A tag is "geographic" when it names one of the six district counties or a
 * district town. Editors tag posts/media with these display names in Sanity;
 * the UI groups them into a place-filter row. */

export const COUNTY_GEO_TAGS = [
  'Crawford County',
  'Dubois County',
  'Gibson County',
  'Perry County',
  'Pike County',
  'Spencer County',
] as const

/* Every place on the district map (incorporated towns and CDPs from the
 * Census place layer), plus Milltown, which straddles the Crawford County
 * line. 'Dubois' is the town in Dubois County, distinct from the county. */
export const CITY_GEO_TAGS = [
  'Alford',
  'Alton',
  'Arthur',
  'Birdseye',
  'Bretzville',
  'Buckskin',
  'Cannelton',
  'Celestine',
  'Chrisney',
  'Dale',
  'Dubois',
  'Eckerty',
  'English',
  'Ferdinand',
  'Fort Branch',
  'Francisco',
  'Gentryville',
  'Glezen',
  'Grandview',
  'Grantsburg',
  'Hatfield',
  'Haubstadt',
  'Haysville',
  'Hazleton',
  'Holland',
  'Huntingburg',
  'Ireland',
  'Jasper',
  'Johnson',
  'Leavenworth',
  'Leopold',
  'Mackey',
  'Marengo',
  'Mariah Hill',
  'Milltown',
  'Newtonville',
  'Oakland City',
  'Otwell',
  'Owensville',
  'Patoka',
  'Petersburg',
  'Princeton',
  'Reo',
  'Richland',
  'Rockport',
  'Santa Claus',
  'Schnellville',
  'Somerville',
  'Spurgeon',
  'St. Anthony',
  'St. Meinrad',
  'Stendal',
  'Taswell',
  'Tell City',
  'Troy',
  'Velpen',
  'Winslow',
] as const

const CANONICAL = new Map<string, string>(
  [...COUNTY_GEO_TAGS, ...CITY_GEO_TAGS].map((name) => [name.toLowerCase(), name])
)

const COUNTY_SET = new Set<string>(COUNTY_GEO_TAGS)

export function canonicalGeoTag(tag: string): string | null {
  return CANONICAL.get(tag.trim().toLowerCase()) ?? null
}

export function isGeoTag(tag: string): boolean {
  return canonicalGeoTag(tag) !== null
}

export function geoTagsIn(tags: string[]): {counties: string[]; cities: string[]} {
  const present = new Set<string>()
  for (const tag of tags) {
    const canonical = canonicalGeoTag(tag)
    if (canonical) present.add(canonical)
  }
  return {
    counties: [...COUNTY_GEO_TAGS].filter((c) => present.has(c)),
    cities: [...CITY_GEO_TAGS].filter((c) => present.has(c) && !COUNTY_SET.has(c)),
  }
}
