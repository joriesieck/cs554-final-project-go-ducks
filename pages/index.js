/*
import layout things
*/
import Head from "next/head";
import { getQuestionData } from "../lib/questions";
export default function Home({ questionData }) {
  return (
    <div>
      <title>Jeopardy</title>
      <h1>test</h1>
    </div>
  );
}

// export async function getServerSideProps(context) {
//   // Make calls to API
//   const questionData = await getQuestionData();
//   return {
//     props: {
//       questionData,
//     },
//   };
// }
