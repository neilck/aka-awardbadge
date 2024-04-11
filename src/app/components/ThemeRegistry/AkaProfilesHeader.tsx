import { useEffect } from "react";
import { render } from "react-dom";

export default function AkaProfilesHeader() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_AKA_EMBED_JS ?? "";
    script.defer = true;
    document.body.appendChild(script);

    const link = document.createElement("link");
    link.href = process.env.NEXT_PUBLIC_AKA_EMBED_CSS ?? "";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return <div id="akaprofiles-header"></div>;
}
