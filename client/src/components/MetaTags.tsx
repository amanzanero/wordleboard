import React from "react";

const MetaTags: React.FC = () => (
  <>
    <meta property="og:url" content="https://wordleboard.xyz" />
    <meta property="og:type" content="website" />
    <meta property="fb:app_id" content="your fb app id" />
    <meta property="og:title" content="WordleBoard" />
    <meta name="twitter:card" content="summary" />
    <meta property="og:description" content="Play wordle with your friends!" />
    <meta property="og:image" content={"url of image"} />
  </>
);

export default MetaTags;
