/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const totalWords = post.data.content.reduce((previousValue, actual) => {
    const text = actual.body.map(body => body.text);
    const wordsArray = text.map(item => item.split(/\s+/));
    const wordTotal = wordsArray.reduce(
      (wordPreviousValue, wordActualValue) =>
        wordPreviousValue + wordActualValue.length,
      1
    );
    return previousValue + wordTotal;
  }, 0);

  const timeExpectedToRead = Math.round(totalWords / 200);

  if (!post) {
    return (
      <>
        <Head>
          <title>{` Post `}</title>
        </Head>

        <Header />

        <main className={commonStyles.container}>
          <h2 className={styles.title}>Carregando...</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{` Post | ${post.data.title} `}</title>
      </Head>

      <Header />

      <img
        className={styles.image}
        src={post.data.banner.url}
        alt="post banner"
      />

      <main className={commonStyles.container}>
        <h2 className={styles.title}>{post.data.title}</h2>

        <div className={commonStyles.postInfo}>
          <time>
            <FiCalendar />
            {post.first_publication_date}
          </time>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {`${timeExpectedToRead} min`}
          </span>
        </div>

        {post.data.content.map(content => (
          <div className={styles.content}>
            <strong className={styles.heading}>{content.heading}</strong>
            {content.body.map(body => (
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: body.text }}
              />
            ))}
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
  };

  return {
    props: { post },
  };
};
