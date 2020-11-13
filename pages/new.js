import React, { useState } from "react";
import Router from "next/router";
import useSWR from "swr";
import { gql } from "graphql-request";
import { useForm } from "react-hook-form";
import Layout from "../components/layout";
import utilsStyles from "../styles/utils.module.css";
import { graphQLClient } from "../utils/graphql-client";
import { getAuthCookie } from "../utils/auth-cookies";

const New = ({ token }) => {
  const fetcher = (url) => fetch(url).then((r) => r.json());

  const { data: user } = useSWR("/api/user", fetcher);
  const [errorMessage, setErrorMessage] = useState("");
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = handleSubmit(async ({ task }) => {
    if (errorMessage) setErrorMessage("");

    const mutation = gql`
      mutation CreateTodo($task: String!, $owner: ID!) {
        createTodo(
          data: { task: $task, completed: false, owner: { connect: $owner } }
        ) {
          task
          completed
          owner {
            _id
          }
        }
      }
    `;

    const variables = {
      task,
      owner: user && user.id,
    };

    try {
      await graphQLClient(token).request(mutation, variables);
      Router.push("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  });

  return (
    <Layout>
      <h1>Create New Todo</h1>

      <form onSubmit={onSubmit} className={utilsStyles.form}>
        <div>
          <label>Task</label>
          <input
            type="text"
            name="task"
            placeholder="what i need to do"
            ref={register({ required: "Task is required" })}
          />
          {errors.task && (
            <span role="alert" className={utilsStyles.error}>
              {errors.task.message}
            </span>
          )}
        </div>

        <div className={utilsStyles.submit}>
          <button type="submit">Create</button>
        </div>
      </form>

      {errorMessage && (
        <p role="alert" className={utilsStyles.errorMessage}>
          {errorMessage}
        </p>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const token = getAuthCookie(context.req);
  return {
    props: {
      token: token || null,
    },
  };
}

export default New;
