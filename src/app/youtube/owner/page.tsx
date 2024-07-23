"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import theme from "../../components/ThemeRegistry/theme";
import { getSession } from "../helper";

import Head from "next/head";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import getErrorMessage from "../../errors";
import { load, LoadResult, doAwardBadge } from "./serverActions";

import { ChannelInfo } from "./ChannelInfoResponse";
import getChannelInfo from "./serverActions";
import GoogleButton from "../GoogleButton";

export default function AddYTOwnerBadge() {
  const { status } = useSession();
  const [handle, setHandle] = useState("");

  let code = "";
  let redirect = "";
  if (typeof window !== "undefined") {
    const queryParameters = new URLSearchParams(window.location.search);
    code = queryParameters.get("code") ?? "";
    redirect = decodeURIComponent(queryParameters.get("redirect") ?? "");
  }

  const [encryptedToken, setEncryptedToken] = useState(""); // token encrypted by server for safe client storage
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | undefined>(
    undefined
  );
  const [stage, setStage] = useState<
    "INITIAL" | "CHECKING" | "VERIFIED" | "NOT_VERIFIED" | "ERROR"
  >("INITIAL");

  const [error, setError] = useState<string | undefined>(undefined);
  const [notVerifiedMesg, setNotVerifiedMesg] = useState<string | undefined>(
    undefined
  );

  const init = async () => {
    let loadResult: LoadResult = { isValidSession: false };
    try {
      loadResult = await load(code);
    } catch (error) {
      const mesg = getErrorMessage(error);
      setError(mesg);
      return;
    }

    if (loadResult.error) {
      setError(loadResult.error ?? "");
      return;
    }

    setEncryptedToken(loadResult.encryptedToken ?? "");
  };

  const effectRan = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV == "development") {
      // prevent running more than once in dev
      if (!effectRan.current) {
        init();
      }
      return () => {
        effectRan.current = true;
      };
    } else {
      init();
    }
  }, []);

  useEffect(() => {
    switch (status) {
      case "authenticated":
        const session = getSession().then((session) => {
          // when session from Google, has accessToken
          const accessToken = session.accessToken;
          if (typeof accessToken != "string" || accessToken === "") {
            setError("Account not available.");
            return;
          } else {
            getChannelInfo(accessToken).then((channelInfo) => {
              setChannelInfo(channelInfo);
            });
          }
        });

        break;
    }
  }, [status]);

  return (
    <Stack id="contentWindow" alignItems="center" marginTop={2}>
      <Head>
        <title>Verified YouTube Channel Owner</title>
      </Head>
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
