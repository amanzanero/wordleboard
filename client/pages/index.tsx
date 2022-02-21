import type { NextPage } from "next";
import { usePersistentBoardState } from "../components/boardState";

const Home: NextPage = () => {
  const { onType, boardState } = usePersistentBoardState();

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex justify-center py-2">
        <h1 className="text-3xl font-bold">WordleBoard</h1>
      </div>
      <hr className="w-full" />
      {/*game container*/}
      <div className="max-w-lg w-full flex flex-col flex-grow  border-red-600 border-2">
        {/*board container*/}
        <div className="flex-grow flex justify-center items-center border-4 border-orange-500 overflow-hidden">
          {/*board*/}
          <div className="h-96 w-80 border-pink-500 border-2 flex flex-col justify-between gap-y-1">
            {/*row*/}
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
            <div className="flex flex-grow w-full gap-x-1">
              {/*tile*/}
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
              <div className="border-2 border-green-600 flex-grow" />
            </div>
          </div>
        </div>
        {/*keyboard container*/}
        <div className="w-full h-48 border-4 border-blue-600" />
      </div>
    </div>
  );
};

export default Home;
