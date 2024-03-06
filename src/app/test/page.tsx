"use client";

import { useState, useEffect } from "react";
import { create, greaterThan10 } from "./actions";
export default function Page() {
  const [value, setValue] = useState(1);
  const [isGreater, setIsGreater] = useState(false);

  useEffect(() => {
    const doSomething = async () => {
      const isGreater = await greaterThan10(value);
      setIsGreater(isGreater);
    };

    doSomething();
  }, [value]);

  return (
    <>
      <form action={create}>
        <input type="text" name="name" />
        <button type="submit">Submit</button>
      </form>
      <button
        onClick={() => {
          if (isGreater) setValue(10);
          else setValue(100);
        }}
      >
        Set to 100
      </button>
      <p>{value}</p>
      <p>{isGreater.toString()}</p>
    </>
  );
}
