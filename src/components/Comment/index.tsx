import { createRef, useEffect } from 'react';

export default function Comment(): JSX.Element {
  const commentBox = createRef<HTMLDivElement>();

  useEffect(() => {
    async function removeChild(): Promise<void> {
      while (commentBox.current.firstChild) {
        commentBox.current.removeChild(commentBox.current.firstChild);
      }
    }

    removeChild().then(() => {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://utteranc.es/client.js');
      script.setAttribute('crossorigin', 'anonymous');
      script.setAttribute('async', 'true');
      script.setAttribute('repo', 'tallesv/nextjs-blog');
      script.setAttribute('issue-term', 'pathname');
      script.setAttribute('theme', 'photon-dark');
      commentBox.current.appendChild(script);
    });
  }, [commentBox]);

  return (
    <div
      ref={commentBox}
      id="inject-comments-for-uterances"
      className="comment-box"
    />
  );
}
