"use client";

import { useState, useEffect } from "react";
import { verifySession } from "@/app/actions/akaActions";

export const SessionChecker = (props: {
  session: string | undefined;
  awardtoken: string | undefined;
  children: React.ReactNode;
}) => {
  const { session, awardtoken, children } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (session && awardtoken) load();
  }, [session, awardtoken]);

  const load = async () => {
    if (session && awardtoken) {
      const result = await verifySession(session, awardtoken);
      console.log(result);
      if (result && result.success) {
        setIsValid(true);
      }

      setIsLoading(false);
    }
  };

  return (
    <>
      {!isLoading && isValid && children}
      {!isLoading && !isValid && <>Session {session} is not valid.</>}
    </>
  );
};
