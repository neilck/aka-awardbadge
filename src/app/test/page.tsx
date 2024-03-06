"use client";

import { useState, useEffect } from "react";
import { sayHello } from "./actions";

export default function Page() {
  const [message, SetMessage] = useState("goodbye");

  useEffect(() => {
    const callSayHello = async () => {
      const mesg = await sayHello();
      SetMessage(mesg);
    };

    callSayHello();
  });
  return (
    <>
      <p>{message}</p>
    </>
  );
}
