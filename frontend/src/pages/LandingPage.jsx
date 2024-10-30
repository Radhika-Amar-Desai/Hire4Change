import React from "react";
import Hero from "../components/hero/Hero";
import Invite from "../components/invite/Invite";
import MissionVision from "../components/missionVision/MissionVision";
import AppInvite from "../components/appInvite/AppInvite";

function LandingPage() {
  return (
      <div className="flex flex-col space-y-24 min-h-screen">
        <Hero />
        <Invite />
        <MissionVision />
        <AppInvite />
      </div>
  );
}

export default LandingPage;