"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  return (
    <>
      Test Page
      <Suspense>
        <ShowSearchParams />
      </Suspense>
    </>
  );
}
