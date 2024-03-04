"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { verifySession } from "../actions/akaActions";
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
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // verifying session lets us know AKA Profiles is making the request
  const checkSession = async () => {
    const session = "Rg7wDuOnYoOhRuGFUrPL";
    const awardtoken = "aTc3qHMUdUyzrDVMhHR8kc";

    const result = await verifySession(session, awardtoken).catch((error) => {
      console.log(error);
      return;
    });

    console.log(result);
    if (result) {
      setIsValidSession(result.success);
    }
  };

  return (
    <>
      Test Page
      <Suspense>
        <ShowSearchParams />
      </Suspense>
      <p>isValidSession: {isValidSession.toString()}</p>
    </>
  );
}
