"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import AkaProfilesHeader from "../components/ThemeRegistry/AkaProfilesHeader";
import { token as getToken, awardBadge } from "@/app/actions/akaActions";
import { ConfigParam, getConfigParamValue } from "@/app/config";
import { Location, getIpToLocation } from "./serverActions";

export default function IpLocate() {
  let code = "";
  let redirect = "";
  if (typeof window !== "undefined") {
    const queryParameters = new URLSearchParams(window.location.search);
    code = queryParameters.get("code") ?? "";
    redirect = decodeURIComponent(queryParameters.get("redirect") ?? "");
  }

  const [token, setToken] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configParams, setConfigParams] = useState<ConfigParam[]>([]);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);

  const [successMesg, setSuccessMesg] = useState("Location has been verified!");
  const [errorMesg, setErrorMesg] = useState("Location could not be verified.");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (code == "") {
        setIsValidSession(false);
        return;
      }

      const result = await getToken(code);

      if (result.error || !result.token) {
        setIsValidSession(false);
        return;
      }

      setToken(result.token);
      setIsValidSession(true);

      // load config
      if (result.payload && result.payload.configParams) {
        const config = result.payload.configParams;
        setConfigParams(config);
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
      setConfigLoaded(true);

      // get location
      const locResult = await getIpToLocation();
      if (locResult != null) setLocation(locResult.location);
      if (locResult?.message) {
        setError(locResult.message);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (configLoaded && location) {
      const matches = checkLocation(location);
      if (matches) {
        // award badge is current location matches user-defined parameters
        setSuccess(successMesg);

        if (token != "") {
          // send location data to AKA Profiles in badge award call
          const awardData: any = {};
          if (location.country_name) awardData.country = location.country_name;
          if (location.state_prov) awardData.region = location.state_prov;
          if (location.city) awardData.city = location.city;

          awardBadge(token, awardData);
        }
      } else {
        setError(errorMesg);
      }
    }
  }, [configLoaded, location]);

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
            padding: 2,
            textAlign: "center",
            width: "95%",
            height: "95%",
          }}
        >
          <AkaProfilesHeader />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              textAlign: "center",
              width: "100%",
              height: "100%",
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
                <Button href={redirect} variant="contained" sx={{ mt: 2 }}>
                  CONTINUE
                </Button>
              </>
            )}
            {error != "" && (
              <>
                <Alert severity="error">
                  <AlertTitle>Not in required location</AlertTitle>
                  {errorMesg}
                </Alert>
                <Button href={redirect} variant="contained" sx={{ mt: 2 }}>
                  CONTINUE
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
