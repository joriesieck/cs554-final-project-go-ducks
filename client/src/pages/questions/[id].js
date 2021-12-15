import Head from "next/head";
import { Button } from "@mui/material";

import axios from "axios";

const baseUrl = "http://jservice.io/api";

export default function QuestionPage({ query, questionData, questionTitle }) {
  return (
    <div>
      <h1>Question:{questionData[query.index].question}</h1>

      <div>
        <section>
          <h2>Answer:</h2>
          <p>What is {questionData[query.index].answer}</p>
        </section>
      </div>
    </div>
  );
}

async function getQuestion(categoryId) {
  const { data } = await axios.get(`${baseUrl}/clues?category=${categoryId}`);
  return data;
}

export async function getServerSideProps({ params, query }) {
  let questionData = await getQuestion(query.category);

  questionData = questionData.filter((question) => {
    return question.question !== "";
  });

  return {
    props: {
      query,
      questionData,
      questionTitle: questionData[query.index].question,
    },
  };
}
