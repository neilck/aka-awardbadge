import continents from "./continents.json";

export interface Continent {
  name: string;
  alpha2: string;
}

export const Continents: Continent[] = continents;

export const getContinentByName = (name: string): Continent | null => {
  for (let i = 0; i < continents.length; i++) {
    const continent = continents[i];
    if (continent.name == name) {
      return continent;
    }
  }
  return null;
};

export const getContinentByCode = (alpha2: string): Continent | null => {
  for (let i = 0; i < continents.length; i++) {
    const continent = continents[i];
    if (continent.alpha2 == alpha2) {
      return continent;
    }
  }
  return null;
};
