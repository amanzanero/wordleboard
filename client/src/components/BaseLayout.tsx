import React from "react";
import { useRouter } from "next/router";

const BaseLayout: React.FC = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center h-full dark:bg-darkmode">
      <div className="justify-center my-3">
        <h1
          className="text-3xl font-bold text-black dark:text-white cursor-pointer"
          onClick={() => router.push("/")}>
          WordleBoard
        </h1>
      </div>
      <hr className="w-full dark:border-gray-600" />
      {children}
    </div>
  );
};

export default BaseLayout;
