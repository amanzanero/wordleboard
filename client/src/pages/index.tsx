import type { NextPage } from "next";
import React from "react";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex justify-center py-2">
        <h1 className="text-3xl font-bold text-black dark:text-white">WordleBoard</h1>
      </div>

      <hr className="w-full dark:border-gray-600" />
    </div>
  );
};

export default Home;
