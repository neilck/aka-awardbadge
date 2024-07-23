"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ButtonBase } from "@mui/material";

export interface GoogleButtonProps {
  disabled: boolean;
}

function GoogleButton(props: GoogleButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    signIn("google");
  };

  return (
    <ButtonBase
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={props.disabled}
      color="primary"
      sx={{
        width: "191px",
        height: "46px",
      }}
    >
      {isHovered ? (
        <img src="/btn_google_signin_dark_focus_web.png" alt="Hovered Image" />
      ) : (
        <img src="/btn_google_signin_dark_normal_web.png" alt="Normal Image" />
      )}
    </ButtonBase>
  );
}

export default GoogleButton;
