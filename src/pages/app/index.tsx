import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";
import router from "next/router";
import type { Session } from "next-auth/core/types";

function App() {
  const { status, data: sessionData } = useSession();

  const checkScopes = (sessionData: Session | null) => {
    if (sessionData?.token.scope?.includes("youtube")) {
      return <div>Authorized for youtube</div>;
    } else {
      return <div>Proceed for youtube authorization</div>;
    }
  };
  const { refetch: refetchVideos } = api.youtube.getYoutubeVideos.useQuery(
    undefined,
    {
      enabled: false,
    },
  );
  const { refetch: refetchTest } = api.notion.createMockPage.useQuery(
    undefined,
    {
      enabled: false,
    },
  );
  const { refetch: refetchSync } = api.youtube.sync.useQuery(undefined, {
    enabled: false,
  });
  const [videos, setVideos] = useState([]);

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-auto py-10">
        <Link
          href={"/api/auth/signin"}
          className="un mx-auto rounded-md border-2 border-slate-500 bg-slate-200 p-2 text-2xl font-bold hover:bg-slate-300"
        >
          Please log in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p>Welcome {sessionData?.user.name}</p>
      <ModeToggle />

      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>
        <Button
          onClick={() => {
            refetchVideos()
              .then((data) => {
                setVideos(data.data?.items);
              })
              .catch((e) => {
                console.error(e);
              });
          }}
        >
          Get Vids
        </Button>
        <Button
          onClick={() => {
            refetchTest()
              .then((data) => {
                console.log(data);
              })
              .catch((e) => {
                console.error(e);
              });
          }}
        >
          Test notion load
        </Button>
        <Button
          onClick={() => {
            refetchSync()
              .then((data) => {
                console.log(data);
              })
              .catch((e) => {
                console.error(e);
              });
          }}
        >
          Sync
        </Button>
      </div>
      <div className="pt-4">
        {videos.map((video) => (
          <li key={video.etag}>{video.snippet.title}</li>
        ))}
      </div>
      <div className="mx-auto flex w-1/3 flex-col rounded-md border border-slate-600 p-4 text-justify">
        <div className="mb-2">
          &ldquo;Welcome to Notion Video Gallery! To begin your journey, we need
          your permission to access essential features. Without authorization,
          Notion Video Gallery won&apos;t function properly, and you won&apos;t
          be able to use the app.
        </div>

        <div className="mb-2">
          Your privacy and data security are our top priorities, and we only
          request the permissions necessary for optimal performance.
        </div>
        <div className="mb-2">
          To get started, click &lsquo;Next&rsquo; and experience the core
          functionalities of Notion Video Gallery.
        </div>
        <div className="text-sm">
          Thank you for choosing Notion Video Gallery—where every permission
          ensures a smoother and more efficient user experience!&rdquo;
        </div>
      </div>
      <Button onClick={() => void router.push("/app/auth/youtube")}>
        Youtube Authorization
      </Button>
      <Button onClick={() => void router.push("/app/auth/notion")}>
        Notion Authorization
      </Button>
      <Button onClick={() => void router.push("/api/auth/test")}>
        req initiator test
      </Button>
      {checkScopes(sessionData)}
    </div>
  );
}

export default App;
