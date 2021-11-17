/*
import layout things
*/
import Head from "next/head";

export default function Question({ questionData }) {
  return (
    <div>
      <Head>
        <title>{questionData.title}</title>
      </Head>
      <article>
        <p>{questionData.answer}</p>
      </article>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getAllQuestionIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  // Make calls to API
  const questionData = await getQuestionData(params.id);
  return {
    props: {
      questionData,
    },
  };
}
