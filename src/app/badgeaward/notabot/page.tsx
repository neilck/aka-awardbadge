"use client";

import { useState, useRef, useEffect } from "react";
import { cookies } from "next/headers";
import Head from "next/head";
import ReCAPTCHA from "react-google-recaptcha";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import { useSearchParams } from "next/navigation";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { postBadgeAward } from "@/app/actions/postBadgeAward";

export default function Notabot() {
  const KEY_V2 = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY_V2!;
  const KEY_V3 = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY_V3!;

  const captchaRef = useRef(null);
  const searchParams = useSearchParams();
  const session = searchParams.get("session");
  const awardToken = searchParams.get("awardtoken");

  const [isAwarded, setIsAwarded] = useState(false);

  const onChangeHandler = async () => {
    if (captchaRef.current) {
      // @ts-ignore
      const token = captchaRef.current.getValue();
      console.log(`token: ${token}`);
      const response = await fetch(`../getCaptchaResult?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const google_response = await response.json();
      if (google_response.success) {
        if (session && awardToken) {
          const result = await postBadgeAward(session, awardToken);
          console.log(result);
          if (result.success) {
            setIsAwarded(true);
          }
        }
      }
    }
  };

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
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              textAlign: "center",
              width: "90%",
              height: "90%",
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
              </>
            )}
            {isAwarded && (
              <>
                <Typography variant="body1" component="div" sx={{ pb: 2 }}>
                  Badge Awarded!
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </ReCaptchaProvider>
    </>
  );
}
