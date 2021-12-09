import Head from 'next/head';
import { getQuestionData } from '../../../lib/questions';
import { useEffect, useState } from 'react';
import axios from 'axios';

const baseUrl = 'http://jservice.io/api';

export default function QuestionPage({ data }) {
  return (
    <div>
      <Head>
        <h1>
          {data.map((category) => {
            return <p>{category.id}</p>;
          })}
        </h1>
      </Head>
    </div>
  );
}

async function getCategories() {
  const { data } = await axios.get('http://jservice.io/api/categories');
  return data;
}

export async function getServerSideProps({ params }) {
  const data = await getCategories();
  console.log(data);
  return {
    props: {
      data,
    },
  };
}
