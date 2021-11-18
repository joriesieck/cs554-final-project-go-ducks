/*
import layout things
*/
import Head from "next/head";

export default function Home({ questionData }) {
  return (
    <div>
      <title>Jeopardy</title>
    </div>
  );
}

// Won't be necessary due to server rendering

// export async function getStaticPaths() {
//   const paths = getAllQuestionIds();
//   return {
//     paths,
//     fallback: false,
//   };
// }

//
export async function getServerSideProps(context) {
  // Make calls to API
  const questionData = await getQuestionData(context.id);
  return {
    props: {
      questionData,
    },
  };
}
