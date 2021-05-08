import { GetStaticProps } from 'next';
import Head from 'next/head';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;
  const [posts, setposts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  function handleLoadMorePosts(): void {
    fetch(nextPage, {
      method: 'GET',
    }).then(response =>
      response.json().then(responseData => {
        const newPosts = responseData.results.map(post => ({
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
          data: post.data,
        }));
        const updatePosts = [...posts, ...newPosts];
        setposts(updatePosts);
        setNextPage(responseData.next_page);
      })
    );
  }

  return (
    <>
      <Head>
        <title> Home | nextjsblog </title>
      </Head>

      <main className={commonStyles.container}>
        <Header />

        {posts.map(post => (
          <div key={post.uid} className={styles.post}>
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div className={styles.postInfo}>
              <time>
                <FiCalendar />
                {post.first_publication_date}
              </time>

              <span>
                <FiUser />
                {post.data.author}
              </span>
            </div>
          </div>
        ))}

        {nextPage && (
          <span
            aria-hidden="true"
            onClick={handleLoadMorePosts}
            onKeyDown={handleLoadMorePosts}
            className={styles.loadMorePosts}
          >
            Carregar mais posts
          </span>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: post.data,
  }));

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
