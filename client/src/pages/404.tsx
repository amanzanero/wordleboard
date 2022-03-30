import type { NextPage } from "next";
import React from "react";
import BaseLayout from "components/BaseLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import MetaTags from "components/MetaTags";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>WordleBoard</title>
        <MetaTags />
      </Head>
      <BaseLayout>
        <div className="flex-grow flex flex-col justify-center space-y-10">
          <p className="text-lg">Whoops, this page doesn&apos;t exist!</p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Go home
          </button>
        </div>
      </BaseLayout>
    </>
  );
};

export default Home;
