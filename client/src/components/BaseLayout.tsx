import React, { useEffect } from "react";
import { useFirebaseAuth, useFirebaseUser } from "../library/auth";
import { useRouter } from "next/router";
import { classnames } from "../utils/classnames";

const BaseLayout: React.FC = ({ children }) => {
  const { logOut } = useFirebaseAuth();
  const { user } = useFirebaseUser();
  const router = useRouter();

  const onLogOutClicked = () => {
    logOut().finally(() => router.push("/"));
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div
        className={classnames(
          "flex p-2 w-full max-w-screen-lg",
          !!user ? "justify-between" : "justify-center",
        )}>
        {!!user && <div className="w-20 h-full" />}
        <h1 className="text-3xl font-bold text-black dark:text-white">WordleBoard</h1>
        {!!user && (
          <button
            onClick={onLogOutClicked}
            className="w-20 p-2 bg-gray-600 text-white rounded uppercase">
            logout
          </button>
        )}
      </div>

      <hr className="w-full dark:border-gray-600" />
      {children}
    </div>
  );
};

export default BaseLayout;
