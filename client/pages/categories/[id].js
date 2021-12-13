import Head from "next/head";
import { Button } from "@mui/material";
import Link from "next/link";

import axios from "axios";

const baseUrl = "http://jservice.io/api";

export default function CategoryPage({ categoryData, children }) {
  return (
    <div>
      <h1>Category: {categoryData.title}</h1>
      <div>{children}</div>
      <div>
        <Button>Random question</Button>
        <Button>Practice Sequence</Button>
        <ul>
          {categoryData.clues.map((question, index) => {
            return (
              <li key={question.id}>
                <Link
                  href={`/questions/${question.id}?category=${question.category_id}&index=${index}`}
                >
                  <a>{question.question}</a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

async function getCategories(id) {
  const { data } = await axios.get(`${baseUrl}/category/?id=${id}`);
  return data;
}

export async function getServerSideProps({ params }) {
  let categoryData = await getCategories(params.id);

  categoryData.clues = categoryData.clues.filter((question) => {
    return question.question !== "";
  });

  return {
    props: {
      categoryData,
    },
  };
}
