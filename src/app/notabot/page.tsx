"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import ReCAPTCHA from "react-google-recaptcha";
import { ReCaptchaProvider } from "next-recaptcha-v3";

import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import getErrorMessage from "../errors";
import { load, LoadResult, doAwardBadge } from "./serverActions";
import { getCaptchaResult } from "./serverActions";

export default function Notabot() {
  const KEY_V2 = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY_V2!;
  const KEY_V3 = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY_V3!;

  const captchaRef = useRef(null);
  let code = "";
  let redirect = "";
  if (typeof window !== "undefined") {
    const queryParameters = new URLSearchParams(window.location.search);
    code = queryParameters.get("code") ?? "";
    redirect = decodeURIComponent(queryParameters.get("redirect") ?? "");
  }

  const [encryptedToken, setEncryptedToken] = useState(""); // token encrypted by server for safe client storage
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const [isAwarded, setIsAwarded] = useState(false);
  const [error, setError] = useState("");

  const init = async () => {
    let loadResult: LoadResult = { isValidSession: false };
    try {
      loadResult = await load(code);
    } catch (error) {
      const mesg = getErrorMessage(error);
      setError(mesg);
      return;
    }
    console.log("encrypted token received.");
    setEncryptedToken(loadResult.encryptedToken ?? "");
    setIsValidSession(loadResult.isValidSession ?? false);
    if (loadResult.error) setError(loadResult.error ?? "");
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
    const doAward = async (
      encryptedToken: string,
      captchaPassed: boolean,
      isAwarded: boolean
    ) => {
      if (encryptedToken != "" && captchaPassed && !isAwarded) {
        const result = await doAwardBadge(encryptedToken).catch((posterror) => {
          setError(posterror);
          setIsChecking(false);
          return;
        });

        if (!result) {
          setError("unknown");
          setIsChecking(false);
          return;
        }

        if (result.success) {
          setIsAwarded(true);
        }
      }
    };

    doAward(encryptedToken, captchaPassed, isAwarded);
  }, [encryptedToken, captchaPassed, isAwarded]);

  // result of reCaptcha
  const onChangeHandler = async () => {
    setIsChecking(true);
    if (captchaRef.current) {
      // @ts-ignore
      const captchaToken = captchaRef.current.getValue();
      const google_response = await getCaptchaResult(captchaToken);

      if (google_response.success) {
        setCaptchaPassed(true);
      }
    }
    setIsChecking(false);
  };

  if (!isValidSession) return <>Invalid session</>;

  return (
    <>
      <Head>
        <title>Not-a-Bot Badge</title>
      </Head>
      <ReCaptchaProvider reCaptchaKey={KEY_V3}>
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
            {/* <AkaProfilesHeader /> */}
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
              {!isAwarded && (
                <>
                  <Typography variant="body1" component="div" sx={{ pb: 2 }}>
                    Please prove that you are not a robot by checking the box
                    below.
                  </Typography>
                  <ReCAPTCHA
                    ref={captchaRef}
                    onChange={onChangeHandler}
                    size="normal"
                    sitekey={KEY_V2}
                  />
                  {isChecking && (
                    <Box pt={3}>
                      <CircularProgress />
                    </Box>
                  )}
                </>
              )}
              {isAwarded && (
                <>
                  <Alert severity="success">
                    <AlertTitle>Success</AlertTitle>
                    Badge has been awarded!
                  </Alert>
                  <Button href={redirect} variant="contained" sx={{ mt: 2 }}>
                    CONTINUE
                  </Button>
                </>
              )}
              {error != "" && (
                <>
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    An error has occcured. {error}
                  </Alert>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </ReCaptchaProvider>
    </>
  );
}
