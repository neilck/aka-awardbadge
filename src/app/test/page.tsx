"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@mui/material";
const ShowSearchParams = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return (
    <>
      {id && <p>{id}</p>}
      {!id && <p>no id</p>}
    </>
  );
};

export default function Home() {
  const [result, setResult] = useState({ success: false, message: "initial" });

  // verifying session lets us know AKA Profiles is making the request
  const handleOnClick = async () => {
    const session = "Rg7wDuOnYoOhRuGFUrPL";
    const awardtoken = "aTc3qHMUdUyzrDVMhHR8kc";

    const response = await fetch("/api/verifySession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: session, awardtoken: awardtoken }),
      cache: "no-cache",
    });

    const data = await response.json();
    console.log(data);
    setResult(data);
  };

  return (
    <>
      Test Page
      <Suspense>
        <ShowSearchParams />
      </Suspense>
      <Button variant="contained" onClick={handleOnClick}>
        Verify Session
      </Button>
      <p>isValidSession: {JSON.stringify(result)}</p>
    </>
  );
}
