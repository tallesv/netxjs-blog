// import { GetStaticProps } from 'next';
import Head from 'next/head';

// import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  // TODO

  return (
    <>
      <Head>
        <title> Home | nextjsblog </title>
      </Head>

      <main className={styles.container}>
        <img src="/images/Logo.svg" alt="logo" />

        <div className={styles.post}>
          <strong>POst title</strong>
          <p>subtitle subtitle subtitle subtitle subtitle subtitle subtitle </p>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar />
              15 mar 2021
            </time>

            <span>
              <FiUser />
              Joseph Oliveira
            </span>
          </div>
        </div>

        <div className={styles.post}>
          <strong>POst title</strong>
          <p>subtitle subtitle subtitle subtitle subtitle subtitle subtitle </p>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar />
              15 mar 2021
            </time>

            <span>
              <FiUser />
              Joseph Oliveira
            </span>
          </div>
        </div>

        <div className={styles.post}>
          <strong>POst title</strong>
          <p>subtitle subtitle subtitle subtitle subtitle subtitle subtitle </p>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar />
              15 mar 2021
            </time>

            <span>
              <FiUser />
              Joseph Oliveira
            </span>
          </div>
        </div>

        <span className={styles.loadMorePosts}>Carregar mais posts</span>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
