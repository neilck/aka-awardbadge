import countries from "./countries.json";

export interface Country {
  name: string;
  alpha2: string;
  alpha3: string;
}
export const Countries: Country[] = countries;

export const getCountryByName = (name: string): Country | null => {
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (country.name == name) {
      return country;
    }
  }
  return null;
};

export const getCountryByCode = (alpha3: string): Country | null => {
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (country.alpha3 == alpha3) {
      return country;
    }
  }
  return null;
};
