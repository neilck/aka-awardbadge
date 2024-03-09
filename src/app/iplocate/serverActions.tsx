"use server";

import { headers } from "next/headers";
import getErrorMessage from "@/app/errors";

export type Location = {
  "ip"?: string; // "1.1.1.1",
  "continent_name"?: string; // "North America",
  "country_code3"?: string; //"AUS",
  "country_name"?: string; // "Australia",
  "state_prov"?: string; // "Queensland",
  "city"?: string; // "South Brisbane",
  "message"?: string; // message on error
} | null;

export type IpLocResult = {
  success: boolean;
  message?: string;
  location?: Location;
};

export const getIpToLocation = async (): Promise<IpLocResult | null> => {
  const apiKey = process.env.IPGEOLOCATION_KEY;

  const ip = headers().get("x-forwarded-for"); // "75.155.176.254"
  // console.log(JSON.stringify(headers()));
  // console.log("IP: " + ip);

  // https://ipgeolocation.io/documentation/ip-geolocation-api.html
  const fields =
    "continent_code,continent_name,country_code3,country_name,state_prov,city";
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}&fields=${fields}`;

  try {
    const response = await fetch(url, { cache: "no-cache" });
    const location: Location = await response.json();
    if (location?.message) {
      // return error;
      return { success: false, message: location.message };
    }

    return { success: true, location: location };
  } catch (error) {
    console.error(`Error during ${url} request:`, error);
    return { success: false, message: getErrorMessage(error), location: null };
  }
};
