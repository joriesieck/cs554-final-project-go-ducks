import Head from "next/head";
import { Button } from '@mui/material'

import axios from "axios";

const baseUrl = "http://jservice.io/api";

export default function CategoryPage({ categoryData }) {
  return (
    <div>
      <Head>
        <h1>
          Category: {categoryData.title}
        </h1>
      </Head>
      <div>
        <Button>Random question</Button>
        <Button>Practice Sequence</Button>
        <ul>
          {categoryData.clues.map((question) => {
            return <li>{question.question}</li>
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
    return (question.question !== "")
  })
  
  return {
    props: {
      categoryData,
    },
  };
}
