import React, { Reducer, useCallback, useReducer } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import DrawerLayout from "components/DrawerLayout";
import MetaTags from "components/MetaTags";
import Modal, { type ModalProps } from "components/Modal";
import { useCreateNewLeaderboard, useJoinLeaderboard, useMyLeaderboards } from "query/leaderboards";
import LoadingSpinner from "components/LoadingSpinner";
import { LeaderboardError, MyLeaderboardsQuery } from "codegen";
import toast, { Toaster } from "react-hot-toast";

const Game: NextPage = () => {
  const router = useRouter();
  const notify = useCallback((text: string) => toast(text), []);

  const [modalState, dispatch] = useReducer(modalReducer, {
    joinModalOpen: false,
    createModalOpen: false,
  });

  const { data, isLoading } = useMyLeaderboards();

  const { mutate: newLeaderboardMutation } = useCreateNewLeaderboard({
    onSuccess: (data) => {
      switch (data.__typename) {
        case "Leaderboard":
          router.push(`/leaderboards/${data.id}`);
          break;
        case "LeaderboardResultError":
          console.error(data.error);
          break;
      }
    },
  });

  const { mutate: joinLeaderboardMutation } = useJoinLeaderboard({
    onSuccess: (data) => {
      switch (data.__typename) {
        case "Leaderboard":
          router.push(`/leaderboards/${data.id}`);
          break;
        case "LeaderboardResultError":
          switch (data.error) {
            case LeaderboardError.DoesNotExist:
              notify("leaderboard does not exist");
              break;
            case LeaderboardError.CouldNotCreate:
            default:
              notify("internal error");
              break;
          }
          break;
      }
    },
  });

  return (
    <>
      <MetaTags />
      <Toaster />
      <DrawerLayout>
        <h1 className=" mt-4 text-xl font-bold">Leaderboards</h1>
        <div className="h-full w-full flex justify-center mt-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="max-w-screen-lg w-full">
              <Content
                data={data}
                openCreateModal={() => dispatch({ type: "open_create" })}
                openJoinModal={() => dispatch({ type: "open_join" })}
              />
            </div>
          )}
        </div>
      </DrawerLayout>
      <JoinModal
        open={modalState.joinModalOpen}
        closeModal={() => dispatch({ type: "close" })}
        onSubmit={(values) => {
          console.log(values);
          joinLeaderboardMutation(values);
        }}
      />
      <CreateModal
        open={modalState.createModalOpen}
        closeModal={() => dispatch({ type: "close" })}
        onSubmit={(values) => {
          console.log(values);
          newLeaderboardMutation(values);
        }}
      />
    </>
  );
};

const Content: React.FC<{
  data: MyLeaderboardsQuery["me"] | undefined;
  openCreateModal: () => void;
  openJoinModal: () => void;
}> = ({ data, openCreateModal, openJoinModal }) => {
  const router = useRouter();

  if (!data) {
    return <div>error</div>;
  }
  switch (data.leaderboards.length) {
    case 0:
      return (
        <div className="flex flex-col mt-4 px-2">
          <span className="px-2">
            Looks like you&apos;re not in any leaderboards, create or join one!
          </span>
          <div className="flex justify-between mt-4 px-2 gap-x-4">
            <button className="btn flex-grow basis-0.5" onClick={openCreateModal}>
              Create
            </button>
            <button className="btn flex-grow basis-0.5" onClick={openJoinModal}>
              Join
            </button>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col w-full px-2 pt-2 h-full">
          {data.leaderboards.map((lb, i) => (
            <div key={`${lb.name}-${i}`}>
              <div
                className="border rounded-lg border-base-300 bg-base-100 p-2 flex"
                key={`${lb.name}-${i}`}
                onClick={() => router.push(`/leaderboards/${lb.id}`)}>
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold">{lb.name}</h2>
                  <p className="text-sm">
                    Members: <span className="font-bold">{lb.members.length}</span>
                  </p>
                </div>
              </div>
              {i < data.leaderboards.length - 1 && (
                <div className="divider w-full" key={`divider-${i}`} />
              )}
            </div>
          ))}
          <div className="flex-grow" />
          <div className="flex justify-between mt-4 px-2 gap-x-4 mb-4">
            <button className="btn flex-grow basis-0.5" onClick={openCreateModal}>
              Create
            </button>
            <button className="btn flex-grow basis-0.5" onClick={openJoinModal}>
              Join
            </button>
          </div>
        </div>
      );
  }
};

type ModalState = {
  joinModalOpen: boolean;
  createModalOpen: boolean;
};

type ModalAction = { type: "open_join" } | { type: "open_create" } | { type: "close" };

const modalReducer: Reducer<ModalState, ModalAction> = (prevState, action) => {
  switch (action.type) {
    case "open_join":
      return { joinModalOpen: true, createModalOpen: false };
    case "open_create":
      return { joinModalOpen: false, createModalOpen: true };
    case "close":
      return { joinModalOpen: false, createModalOpen: false };
  }
};

type CreateInputs = {
  name: string;
};

type CreateOrJoinModalProps<T> = {
  open: boolean;
  closeModal: ModalProps["closeModal"];
  onSubmit: SubmitHandler<T>;
};

const CreateModal: React.FC<CreateOrJoinModalProps<CreateInputs>> = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInputs>();

  return (
    <Modal open={props.open} closeModal={props.closeModal} title={"Create a Leaderboard!"}>
      <form
        className="flex-grow h-full flex flex-col items-center gap-y-4"
        onSubmit={handleSubmit(props.onSubmit)}>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What would you like to name this leaderboard?</span>
          </label>
          <input
            type="text"
            placeholder="example: Garcia family wordle"
            className="input input-bordered w-full max-w-xs"
            {...register("name", { required: true })}
          />
          {errors.name && (
            <div className="w-full max-w-xs pl-2 mt-2">
              <span className="text-red-600">This field is required</span>
            </div>
          )}
        </div>
        <div className="flex-grow" />
        <div className="w-full flex justify-between gap-x-6">
          <button className="flex-grow basis-0.5 btn" onClick={props.closeModal} type="button">
            cancel
          </button>
          <input id="create-submit" className="basis-0 invisible" type="submit" title="join" />
          <label htmlFor="create-submit" className="btn flex-grow basis-0.5">
            Create
          </label>
        </div>
      </form>
    </Modal>
  );
};

type JoinInputs = {
  id: string;
};

const JoinModal: React.FC<CreateOrJoinModalProps<JoinInputs>> = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinInputs>();

  return (
    <Modal open={props.open} closeModal={props.closeModal} title={"Join a leaderboard!"}>
      <form
        className="flex-grow h-full flex flex-col items-center gap-y-4"
        onSubmit={handleSubmit(props.onSubmit)}>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Enter the ID that was shared with you:</span>
          </label>
          <input
            type="text"
            placeholder="Leaderboard ID"
            className="input input-bordered w-full max-w-xs"
            {...register("id", { required: true })}
          />
          {errors.id && (
            <div className="w-full max-w-xs pl-2 mt-2">
              <span className="text-red-600">This field is required</span>
            </div>
          )}
        </div>
        <div className="flex-grow" />
        <div className="w-full flex justify-between gap-x-6">
          <button className="flex-grow basis-0.5 btn" onClick={props.closeModal} type="button">
            cancel
          </button>
          <input id="join-submit" className="basis-0 invisible" type="submit" title="join" />
          <label htmlFor="join-submit" className="btn flex-grow basis-0.5">
            Join
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default Game;
