"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";

import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { verifySession, awardBadge, getConfig } from "@/app/actions/akaActions";
import { ConfigParams, getConfigParamValue } from "@/app/config";
import { Location, getIpToLocation } from "../actions/getIpToLocation";

export default function IpLocate() {
  const searchParams = useSearchParams();
  const session = searchParams.get("session");
  const awardtoken = searchParams.get("awardtoken");

  const [isValidSession, setIsValidSession] = useState(false);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [configParams, setConfigParams] = useState<ConfigParams | undefined>(
    undefined
  );
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);

  const [successMesg, setSuccessMesg] = useState("Location has been verified!");
  const [errorMesg, setErrorMesg] = useState("Location could not be verified.");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    if (session && awardtoken) {
      // verifying session lets us know AKA Profiles is making the request
      const result = await verifySession(session, awardtoken);
      if (result && result.success) {
        setIsValidSession(true);
        getUserParams();
        getLocation();
      }
    }
  };

  useEffect(() => {
    if (configParams && location) {
      const matches = checkLocation(location);
      if (matches) {
        // award badge is current location matches user-defined parameters
        setSuccess(successMesg);

        if (session && awardtoken) {
          // send location data to AKA Profiles in badge award call
          const awardData: any = {};
          if (location.country_name)
            awardData.d_country = location.country_name;
          if (location.state_prov) awardData.d_region = location.state_prov;
          if (location.city) awardData.d_city = location.city;

          awardBadge(session, awardtoken, awardData);
        }
      } else {
        setError(errorMesg);
      }
    }
  }, [configParams, location]);

  /**
   * Queries AKA Profiles for any saved user-configuration parameters
   * @returns UserParams
   */
  const getUserParams = async () => {
    const config = await getConfig(session!, awardtoken!);
    if (!config) {
      // set to empty to trigger check
      setConfigParams({ configParams: [] });
      return;
    }

    setConfigParams(config);
    if (config) {
      const country = getConfigParamValue("Country", config);
      if (country != "") setCountry(country);
      const state = getConfigParamValue("State/Prov", config);
      if (state != "") setState(state);
      const city = getConfigParamValue("City", config);
      if (city != "") setCity(city);

      if (country || state || city) {
        let loc = "";
        if (city) loc = ` ${loc} ${city},`;
        if (state) loc = ` ${loc} ${state},`;
        if (country) loc = ` ${loc} ${country}.`;
        setSuccessMesg(`Verified in location${loc}`);
        setErrorMesg(`Not in ${loc}`);
      }
    }

    return config;
  };

  /**
   * Get geo location based on IP Address
   * @returns IpLocResult
   */
  const getLocation = async () => {
    const result = await getIpToLocation();

    if (result != null) setLocation(result.location);
    if (result?.message) {
      setError(result.message);
    }
    return result;
  };

  /**
   * If user-defined parameters specifies match values, determine if matches
   * If no user-defined parameters, return match.
   * @param location
   * @returns boolean
   */
  const checkLocation = (location: Location) => {
    let matches = true;
    if (country && country != location?.country_name) matches = false;
    if (state && state != location?.state_prov) matches = false;
    if (city && city != location?.city) matches = false;

    return matches;
  };

  if (!isValidSession) return <></>;

  return (
    <>
      <Head>
        <title>IP Location Badge</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 2,
            textAlign: "center",
            width: "90%",
            height: "90%",
          }}
        >
          {location && (
            <Box pb={2}>
              <Grid
                container
                spacing={1}
                maxWidth="400px"
                textAlign="left"
                border={1}
                padding={2}
              >
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight={800}>
                    Country
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {location.country_name}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight={800}>
                    State/Prov
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {location.state_prov}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight={800}>
                    City
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {location.city}
                </Grid>
              </Grid>
            </Box>
          )}
          {success != "" && (
            <>
              <Alert severity="success">
                <AlertTitle>Location Verified</AlertTitle>
                {successMesg}
              </Alert>
            </>
          )}
          {error != "" && (
            <>
              <Alert severity="error">
                <AlertTitle>Not in required location</AlertTitle>
                {errorMesg}
              </Alert>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
