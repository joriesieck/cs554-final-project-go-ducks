import Head from "next/head";
import getCategoriesData from "../../lib/categories";

export default async function CategoryPage({ categoryData }) {
  return (
    <div>
      <Head>
        <title>{categoryData[0].title}</title>
      </Head>

      <article>
        <h1>Test</h1>
        <h1>{categoryData[0].title}</h1>
      </article>
    </div>
  );
}

// export async function getServerSideProps({ params }) {
//   const categoryData = await getCategoriesData(0);
//   return {
//     props: {
//       categoryData,
//     },
//   };
// }
