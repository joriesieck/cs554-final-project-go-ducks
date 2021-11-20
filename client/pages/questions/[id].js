import Head from "next/head";
import getQuestionData from "../../lib/questions";

export default async function QuestionPage({ questionData }) {
  return (
    <div>
      <Head>
        <title>{questionData.name}</title>
      </Head>
      <article>
        <h1>{questionData.name}</h1>
      </article>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const questionData = await getQuestionData(params.id);
  return {
    props: {
      questionData,
    },
  };
}
