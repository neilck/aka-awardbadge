"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import AkaProfilesHeader from "../components/ThemeRegistry/AkaProfilesHeader";
import ReCAPTCHA from "react-google-recaptcha";
import { ReCaptchaProvider } from "next-recaptcha-v3";

import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { token as getToken, awardBadge } from "@/app/actions/akaActions";
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

  const [token, setToken] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const [isAwarded, setIsAwarded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      if (code == "") {
        setIsValidSession(false);
        return;
      }

      const result = await getToken(code);

      if (result.error) {
        console.log(`Error verifying token: ${result.error}`);
        setIsValidSession(false);
        return;
      }

      if (!result.token) {
        console.log(`Token missing from response.`);
        setIsValidSession(false);
        return;
      }

      setToken(result.token);
      setIsValidSession(true);
    };

    checkSession();
  }, []);

  // result of reCaptcha
  const onChangeHandler = async () => {
    setIsChecking(true);
    if (captchaRef.current) {
      // @ts-ignore
      const captchaToken = captchaRef.current.getValue();
      const google_response = await getCaptchaResult(captchaToken);

      if (google_response.success) {
        // award badge is successful
        if (token != "") {
          const result = await awardBadge(token).catch((posterror) => {
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
                    An error has occcured. ${error}
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
