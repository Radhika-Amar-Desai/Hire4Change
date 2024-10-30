import React from "react";
import ASSETS from "../../config/assetsConfig";

const MISSION_HEADING = "Our Mission";
const MISSION_SUBHEADING = "Secure meaningful employment opportunities";
const MISSION_CONTENT =
  "To empower individuals from marginalized communities by providing them with a platform to showcase their skills and secure meaningful employment opportunities, thereby fostering social and economic inclusion.";
const MISSION_POSITION = "left";

const VISION_HEADING = "Our Vision";
const VISION_SUBHEADING = "Contribute to a stronger and more equitable economy";
const VISION_CONTENT =
  "To create a world where every individual, regardless of their background, has the opportunity to contribute their talents and realize their full potential through equitable employment.";
const VISION_POSITION = "right";

const ImageTextBlock = ({
  imageUrl,
  heading,
  subHeading,
  content,
  imagePosition,
}) => {
  const componentsFlow =
    imagePosition == "left" ? "flex-row" : "flex-row-reverse";

  return (
    <div
      className={`flex ${componentsFlow} h-[35vw] ml-[10vw] mr-[10vw] space-x-4`}
    >
      <img
        src={imageUrl}
        alt="Image"
        className="w-[40vw] h-[35vw] rounded-lg"
      />

      <div class="w-1/2 space-y-2 px-[5vw]">
        <p
          class="text-[4vw] font-semibold"
          
        >
          {heading}
        </p>
        <br />
        <p
          class="text-[2vw] text-zinc-500"
        >
          {subHeading}
        </p>
        <div className="text-[1.5vw] text-zinc-500">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

const MissionAndVision = () => {
  return (
    <div className="grid grid-rows-2 space-y-[4vw]">
      <ImageTextBlock
        heading={MISSION_HEADING}
        subHeading={MISSION_SUBHEADING}
        imageUrl={ASSETS.missionImg}
        content={MISSION_CONTENT}
        imagePosition={MISSION_POSITION}
      />

      <ImageTextBlock
        heading={VISION_HEADING}
        subHeading={VISION_SUBHEADING}
        imageUrl={ASSETS.visionImg}
        content={VISION_CONTENT}
        imagePosition={VISION_POSITION}
      />
    </div>
  );
};

const Review = () => {
  return (
    <div>
      <MissionAndVision />
    </div>
  );
};

export default Review;
