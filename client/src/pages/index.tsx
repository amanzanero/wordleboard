import type { NextPage } from "next";
import React, { useEffect } from "react";
import BaseLayout from "components/BaseLayout";
import FacebookLoginButton from "components/FacebookLoginButton";
import GoogleLoginButton from "components/GoogleLoginButton";
import { useFirebaseAuth, useFirebaseUser } from "library/auth";
import { useRouter } from "next/router";
import Head from "next/head";
import MetaTags from "components/MetaTags";
import LoadingSpinner from "components/LoadingSpinner";
import { IS_DEV } from "../constants";

const Home: NextPage = () => {
  const { user, loading } = useFirebaseUser();
  const { facebookAuth, googleAuth, devLogin } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !!user) {
      router.push("/game");
    }
  }, [loading, router, user]);

  return (
    <>
      <Head>
        <title>WordleBoard</title>
        <MetaTags />
      </Head>
      <BaseLayout>
        <div className="flex-grow h-full flex flex-col justify-center space-y-4">
          {loading || !!user ? (
            <LoadingSpinner />
          ) : (
            <>
              <FacebookLoginButton onClick={facebookAuth} />
              <GoogleLoginButton onClick={googleAuth} />
              {IS_DEV && (
                <>
                  <button
                    onClick={() => devLogin("uuid")}
                    className="bg-white dark:bg-blue-600 text-gray-600 dark:text-white p-2 text-lg rounded hover:ring-2 border border-gray-200 dark:border-0">
                    Login with dev user
                  </button>
                  <button
                    onClick={() => devLogin("uuid2")}
                    className="bg-white dark:bg-blue-600 text-gray-600 dark:text-white p-2 text-lg rounded hover:ring-2 border border-gray-200 dark:border-0">
                    Login with dev user 2
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </BaseLayout>
    </>
  );
};

export default Home;
