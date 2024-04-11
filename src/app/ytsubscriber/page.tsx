"use client";

import theme from "../components/ThemeRegistry/theme";

import { useEffect, useState, useRef } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AkaProfilesHeader from "../components/ThemeRegistry/AkaProfilesHeader";
import { token as getToken, awardBadge } from "@/app/actions/akaActions";
import { ChannelInfo } from "./ChannelInfoResponse";
import getChannelInfo, { verifySubscription } from "./serverActions";
import GoogleButton from "./GoogleButton";
import { getConfigParamValue } from "@/app/config";

const getSession = async () => {
  const url = `/api/auth/session`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-cache",
  });

  const session = await response.json();
  // console.log(url);
  // console.log(session);
  if (Object.entries(session).length === 0) return null;
  else return session;
};

export default function AddYtSubscriberBadge() {
  const [handle, setHandle] = useState("");
  const [session, setSession] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  let code = "";
  let redirect = "";
  if (typeof window !== "undefined") {
    const queryParameters = new URLSearchParams(window.location.search);
    code = queryParameters.get("code") ?? "";
    redirect = decodeURIComponent(queryParameters.get("redirect") ?? "");
  }

  const [token, setToken] = useState("");
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | undefined>(
    undefined
  );
  const [stage, setStage] = useState<
    "INITIAL" | "CHECKING" | "VERIFIED" | "NOT_VERIFIED" | "ERROR"
  >("INITIAL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notVerifiedMesg, setNotVerifiedMesg] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const load = async () => {
      if (code == "") {
        return;
      }

      const result = await getToken(code);
      if (result.error || !result.token) {
        return;
      }

      console.log(`got token ${JSON.stringify(result)}`);
      setToken(result.token);

      // load config
      if (result.payload && result.payload.configParams) {
        const config = result.payload.configParams;

        console.log(`config ${config}`);
        const handle = getConfigParamValue("handle", config);
        setHandle(handle ?? "");
      }

      // load session
      const session = await getSession();
      setSession(session);
      setLoggedIn(session != null);
    };

    load();
  }, []);

  useEffect(() => {
    const loadHandle = async () => {
      if (handle != "") {
        const channelInfo = await getChannelInfo(handle);
        setChannelInfo(channelInfo);
        setIsLoading(false);
      }
    };

    loadHandle();
  }, [handle]);

  useEffect(() => {
    const runCheck = async () => {
      setError(undefined);
      setNotVerifiedMesg(undefined);

      console.log(`checking for session ${JSON.stringify(session)}`);

      if (
        !session ||
        !channelInfo ||
        !session.accessToken ||
        session.accessToken == ""
      ) {
        setError("Account not available.");

        return;
      }

      const accessToken = session.accessToken;

      console.log("runCheck called with accessToken: " + accessToken);

      const success = await verifySubscription(accessToken, channelInfo.id);
      if (success) {
        setStage("VERIFIED");
        await awardBadge(token);
      } else {
        let email = session.user?.email;
        if (!email) email = "";
        setNotVerifiedMesg(
          `User ${email} is not subscribed to ${channelInfo.snippet.title}.`
        );
        setStage("NOT_VERIFIED");
      }
    };

    if (!isLoading && loggedIn) {
      runCheck();
    }
  }, [isLoading]);

  return (
    <Stack id="contentWindow" alignItems="center" marginTop={2}>
      <AkaProfilesHeader />
      <Box
        id="contentArea"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: 1.5,
          maxWidth: "360px",
          padding: 2,
        }}
      >
        <Stack direction="column" alignItems="center" width="100%">
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "106px",
              minWidth: "320px",
              maxWidth: "360px",
              border: 1,
              borderColor: "grey.400",
              borderRadius: "6px",
              p: 1,
            }}
          >
            {channelInfo && (
              <>
                <Avatar
                  src={channelInfo.snippet.thumbnails.default.url}
                  sx={{
                    width: channelInfo.snippet.thumbnails.default.width,
                    height: channelInfo.snippet.thumbnails.default.height,
                    mr: 2,
                  }}
                ></Avatar>
                <Stack direction="column" width="100%">
                  <Typography variant="h5">
                    {channelInfo.snippet.title}
                  </Typography>
                  <Typography variant="body2">{handle}</Typography>
                  <Typography
                    noWrap
                    variant="body1"
                    fontWeight={500}
                    sx={{ minWidth: 0, width: "240px", pt: 0.5 }}
                  >
                    {channelInfo.snippet.description}
                  </Typography>
                </Stack>
              </>
            )}
          </Box>

          {(stage == "INITIAL" ||
            stage == "NOT_VERIFIED" ||
            stage == "ERROR") && (
            <>
              <Box pt={1} pb={2}>
                <Typography
                  paddingTop={1}
                  variant="body2"
                  align="left"
                  color={theme.palette.grey[800]}
                  fontWeight="bold"
                >
                  Sign in and allow AKA Profiles to View your YouTube account.
                </Typography>
              </Box>
              <GoogleButton disabled={false}></GoogleButton>
              <Box pt={1} pb={2}>
                <Typography
                  paddingTop={1}
                  variant="subtitle2"
                  align="left"
                  color={theme.palette.grey[800]}
                >
                  Only your subscription to {channelInfo?.snippet.title} will be
                  verified. No other personal information will be saved.
                </Typography>
              </Box>
            </>
          )}
          {stage == "CHECKING" && (
            <Box p={4}>
              <CircularProgress />
            </Box>
          )}
        </Stack>
        {error && (
          <Alert
            severity="error"
            onClose={() => {
              setError(undefined);
            }}
            sx={{ bgcolor: theme.palette.common.white }}
          >
            {error}
          </Alert>
        )}
        {stage == "NOT_VERIFIED" && (
          <>
            <Alert severity="error">
              <AlertTitle>Subscription Not Found</AlertTitle>
              {notVerifiedMesg}
            </Alert>
          </>
        )}
        {stage == "VERIFIED" && (
          <>
            <Alert severity="success">
              <AlertTitle>Verified Subscriber</AlertTitle>
              Channel subscription successfully verified.
            </Alert>
            <Button href={redirect} variant="contained" sx={{ mt: 2 }}>
              CONTINUE
            </Button>
          </>
        )}
      </Box>
    </Stack>
  );
}
