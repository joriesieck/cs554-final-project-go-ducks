import Head from "next/head";
import { getQuestionData } from "../../lib/questions";
import { useEffect, useState } from "react";

const baseUrl = "http://jservice.io/api";

export default function QuestionPage({ categories }) {
  return (
    <div>
      <Head>
        <h1>
          {categories.map((category) => (
            <p>{category.id}</p>
          ))}
        </h1>
      </Head>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const categories = await fetch("http://jservice.io/api/categories").then(
    (res) => res.json()
  );
  console.log(categories);
  return {
    props: {
      categories,
    },
  };
}
