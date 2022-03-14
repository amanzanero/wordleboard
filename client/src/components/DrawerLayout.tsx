import React from "react";
import { useFirebaseAuth, useFirebaseUser } from "../library/auth";
import { useRouter } from "next/router";

const DrawerLayout: React.FC = ({ children }) => {
  const { logOut } = useFirebaseAuth();
  const { user } = useFirebaseUser();
  const router = useRouter();

  const onLogOutClicked = () => {
    logOut().finally(() => router.push("/"));
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="drawer h-screen w-full rounded dark:bg-darkmode">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="flex flex-col items-center h-full">
            <div className={"flex p-2 w-full max-w-screen-lg items-center justify-between"}>
              <label
                htmlFor="my-drawer"
                className="drawer-button p-3 border border-gray-300 dark:border-0 dark:bg-gray-600 rounded">
                <svg
                  className="fill-black dark:fill-white"
                  viewBox="0 0 100 80"
                  width="20"
                  height="20">
                  <rect width="100" height="20" />
                  <rect y="30" width="100" height="20" />
                  <rect y="60" width="100" height="20" />
                </svg>
              </label>
              <h1 className="text-3xl font-bold text-black dark:text-white">WordleBoard</h1>
              <div className="p-4">{"  "}</div>
            </div>
            <hr className="w-full dark:border-gray-600" />
            {children}
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay" />
          <div className="menu p-4 overflow-y-auto w-64 sm:w-80 bg-base-100 flex flex-col">
            <button className="btn mb-4" onClick={() => router.push("/game")}>
              play
            </button>
            <button className="btn" onClick={() => router.push("/leaderboards")}>
              leaderboards
            </button>
            <div className="flex-grow" />
            {!!user && (
              <button
                onClick={onLogOutClicked}
                className="w-full p-2 border border-gray-300 dark:border-0 text-black dark:text-white dark:bg-gray-600 hover:bg-gray-700 hover:border-0 hover:text-white transition-colors rounded uppercase">
                logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawerLayout;
