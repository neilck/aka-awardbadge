"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

import {
  Continent,
  Continents,
  getContinentByName,
  getContinentByCode,
} from "../config/Continents";
import {
  Country,
  Countries,
  getCountryByName,
  getCountryByCode,
} from "../config/Countries";
import { Location, getIpToLocation } from "../actions/getIpToLocation";

import {
  loadIpLocateConfig,
  saveIpLocateConfig,
  IpLocateConfig,
} from "../actions/myActions";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ConfigPage() {
  const searchParams = useSearchParams();
  const configId = searchParams.get("config");
  const ipgeourl = "https://ipgeolocation.io/ip-location/";

  const [ipLocateConfig, setIpLocateConfig] = useState<IpLocateConfig | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    null
  );
  const [region, setRegion] = useState(""); // prov / state
  const [city, setCity] = useState("");
  const [byContinent, setByContinent] = useState(false);

  useEffect(() => {
    if (configId) {
      loadIpLocateConfig(configId).then((result) => {
        setIpLocateConfig(result);
      });
    } else {
      getLocation();
    }
  }, []);

  useEffect(() => {
    if (ipLocateConfig != null) {
      setByContinent(ipLocateConfig.continent_alpha2 == "");
      setSelectedContinent(getContinentByCode(ipLocateConfig.continent_alpha2));
      setSelectedCountry(getCountryByCode(ipLocateConfig.country_alpha3));
      setRegion(ipLocateConfig.region);
      setCity(ipLocateConfig.city);
    } else {
      setSelectedContinent(null);
      setSelectedCountry(null);
      setRegion("");
      setCity("");
      setByContinent(false);
    }
  }, [ipLocateConfig]);

  const getLocation = async () => {
    getIpToLocation().then((result) => {
      if (result != null && result.success && result.location) {
        const location = result.location;

        setByContinent(false);
        setSelectedContinent(null);

        if (location.country_code3) {
          setSelectedCountry(getCountryByCode(location.country_code3));
        }

        setRegion(location.state_prov ? location.state_prov : "");
        setCity(location.city ? location.city : "");
      }
    });
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.currentTarget.id) {
      case "region":
        setRegion(event.currentTarget.value);
        break;
      case "city":
        setCity(event.currentTarget.value);
        break;
    }
  };

  const onCheckChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setByContinent(checked);
  };

  const onSaveClicked = () => {
    let data: IpLocateConfig | null = null;
    if (byContinent && selectedContinent) {
      data = {
        continent_alpha2: selectedContinent.alpha2,
        country_alpha3: "",
        region: "",
        city: "",
      };
    } else {
      if (selectedCountry) {
        data = {
          continent_alpha2: "",
          country_alpha3: selectedCountry.alpha3,
          region: region,
          city: city,
        };
      }
    }

    console.log(data);

    if (data && configId) {
      saveIpLocateConfig(configId, data);
    }
  };

  return (
    <>
      <Head>
        <title>IP to Location Badge Configuration</title>
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
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={0}
            pl={2}
            pr={2}
          >
            <Box sx={{ pt: 2 }}>
              <Typography variant="h5">
                IP to Location Badge Configuration
              </Typography>
              <Typography pt={2} pb={2} textAlign="left" variant="body1">
                Issues badge based on the user's current IP address location.
              </Typography>
              <Typography textAlign="left" variant="body1">
                Leave Region and City blank to match only based on Country.
              </Typography>
              <Box textAlign="left">
                <Link href={ipgeourl} target="_blank" rel="noopener noreferrer">
                  Test an IP using IP Geolocation
                </Link>
              </Box>
              <Typography pt={1}>
                <b>Warning: VPN users can pretend to be in another location.</b>
              </Typography>

              <Typography pt={2} textAlign="left" variant="body1">
                Award badge only when matching conditions below.
              </Typography>
            </Box>

            {byContinent && (
              <>
                <Box sx={{ pt: 2, width: "100%" }}>
                  <Autocomplete
                    fullWidth
                    options={Continents}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.alpha2})`
                    }
                    value={selectedContinent}
                    onChange={(_, newValue) => {
                      setSelectedContinent(newValue);
                      setSelectedCountry(null);
                      setRegion("");
                      setCity("");
                    }}
                    renderInput={(params) => (
                      <>
                        <TextField
                          {...params}
                          label="Continent"
                          variant="outlined"
                          fullWidth
                        />
                      </>
                    )}
                  />
                </Box>
              </>
            )}

            {!byContinent && (
              <>
                <Box sx={{ pt: 2, width: "100%" }}>
                  <Autocomplete
                    fullWidth
                    options={Countries}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.alpha3})`
                    }
                    value={selectedCountry}
                    onChange={(_, newValue) => {
                      setSelectedCountry(newValue);
                      setRegion("");
                      setCity("");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Box>
                <Box sx={{ pt: 2.5, width: "100%" }}>
                  <TextField
                    id="region"
                    label="Region (State/Prov)"
                    value={region}
                    onChange={onChangeHandler}
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box sx={{ pt: 2.5, width: "100%" }}>
                  <TextField
                    id="city"
                    label="City"
                    value={city}
                    onChange={onChangeHandler}
                    size="small"
                    fullWidth
                  />
                </Box>
              </>
            )}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={byContinent} onChange={onCheckChanged} />
                }
                label="by continent only"
                componentsProps={{ typography: { variant: "body2" } }}
              />
            </FormGroup>
            <Button onClick={onSaveClicked}>Save</Button>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}
