/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Comment from '../../components/Comment';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
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
  previousPost: Post | null;
  nextPost: Post | null;
  preview: boolean;
}

export default function Post({
  post,
  preview,
  previousPost,
  nextPost,
}: PostProps): JSX.Element {
  const totalWords = post?.data.content.reduce((previousValue, actual) => {
    const text = actual.body.map(body => body.text);
    const wordsArray = text.map(item => item.split(/\s+/));
    const wordTotal = wordsArray.reduce(
      (wordPreviousValue, wordActualValue) =>
        wordPreviousValue + wordActualValue.length,
      1
    );
    return previousValue + wordTotal;
  }, 0);

  const timeExpectedToRead = Math.round(totalWords / 200) + 1;

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{` Post | ${post.data.title} `}</title>
      </Head>

      <Header />

      {/* <img
        className={styles.image}
        src={post.data.banner.url}
        alt="post banner"
      /> */}

      <main className={commonStyles.container}>
        <h2 className={styles.title}>{post.data.title}</h2>

        <div className={commonStyles.postInfo}>
          <time>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
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

        {post.last_publication_date && (
          <span className={styles.lastUpdated}>
            <i>{`* editado em ${format(
              new Date(post.first_publication_date),
              "dd MMM yyyy', às' HH:mm",
              {
                locale: ptBR,
              }
            )}`}</i>
          </span>
        )}

        {post.data.content.map(content => (
          <div
            key={content.heading !== '' ? content.heading : Math.random() * 100}
            className={styles.content}
          >
            <strong className={styles.heading}>{content.heading}</strong>
            {content.body.map((body, index) => (
              <div
                key={`${body.text}_${index}`}
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: body.text }}
              />
            ))}
          </div>
        ))}

        <div className={styles.divisorLine} />

        <div className={styles.previousAndNextPost}>
          {previousPost ? (
            <Link href={`/post/${previousPost.uid}`}>
              <div>
                <span>{previousPost.data.title}</span>
                <span>Post anterior</span>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link href={`/post/${nextPost.uid}`}>
              <div>
                <span>{nextPost.data.title}</span>
                <span>Próximo post</span>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <Comment />

        {preview && (
          <Link href="/api/exit-preview">
            <aside className={commonStyles.previewExit}>
              <a>Sair do modo Preview</a>
            </aside>
          </Link>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params: { slug },
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const previousPost = await prismic.queryFirst(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.queryFirst(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date:
      response.last_publication_date !== response.first_publication_date
        ? response.last_publication_date
        : null,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
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
    props: {
      post,
      preview,
      previousPost: previousPost || null,
      nextPost: nextPost || null,
    },
  };
};
