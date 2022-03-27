import React, { Reducer, useReducer } from "react";
import type { NextPage } from "next";
import { useForm, SubmitHandler } from "react-hook-form";
import DrawerLayout from "components/DrawerLayout";
import MetaTags from "components/MetaTags";
import Modal, { type ModalProps } from "components/Modal";

const Game: NextPage = () => {
  const leaderBoards = [];
  const [modalState, dispatch] = useReducer(modalReducer, {
    joinModalOpen: false,
    createModalOpen: false,
  });

  return (
    <>
      <MetaTags />
      <DrawerLayout>
        <div className="h-full">
          {leaderBoards.length === 0 ? (
            <div className="flex flex-col mt-4 px-2">
              <span className="px-2">
                Looks like you&apos;re not in any leaderboards, create or join one!
              </span>
              <div className="flex justify-between mt-4 px-2 gap-x-4">
                <button
                  className="btn flex-grow basis-0.5"
                  onClick={() => dispatch({ type: "open_create" })}>
                  Create
                </button>
                <button
                  className="btn flex-grow basis-0.5"
                  onClick={() => dispatch({ type: "open_join" })}>
                  Join
                </button>
              </div>
            </div>
          ) : (
            <div>not empty</div>
          )}
        </div>
      </DrawerLayout>
      <JoinModal
        open={modalState.joinModalOpen}
        closeModal={() => dispatch({ type: "close" })}
        onSubmit={() => console.log("submit")}
      />
      <CreateModal
        open={modalState.createModalOpen}
        closeModal={() => dispatch({ type: "close" })}
        onSubmit={() => console.log("submit")}
      />
    </>
  );
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

type CreateOrJoinModalProps = {
  open: boolean;
  closeModal: ModalProps["closeModal"];
  onSubmit: () => void;
};

const CreateModal: React.FC<CreateOrJoinModalProps> = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInputs>();
  const onSubmit: SubmitHandler<CreateInputs> = (data) => console.log(data);

  return (
    <Modal open={props.open} closeModal={props.closeModal} title={"Create a Leaderboard!"}>
      <form
        className="flex-grow h-full flex flex-col items-center gap-y-4"
        onSubmit={handleSubmit(onSubmit)}>
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
          <input id="join-submit" className="basis-0 invisible" type="submit" title="join" />
          <label htmlFor="join-submit" className="btn flex-grow basis-0.5">
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

const JoinModal: React.FC<CreateOrJoinModalProps> = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinInputs>();
  const onSubmit: SubmitHandler<JoinInputs> = (data) => console.log(data);

  return (
    <Modal open={props.open} closeModal={props.closeModal} title={"Join a leaderboard!"}>
      <form
        className="flex-grow h-full flex flex-col items-center gap-y-4"
        onSubmit={handleSubmit(onSubmit)}>
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
