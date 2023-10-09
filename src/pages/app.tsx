import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import Link from "next/link";

function App() {
  const { status } = useSession();
  const { refetch } = api.example.getYoutubeVideos.useQuery(undefined, {
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
            refetch()
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
      </div>
      <div className="pt-4">
        {videos.map((video) => (
          <li key={video.etag}>{video.snippet.title}</li>
        ))}
      </div>
    </div>
  );
}

export default App;
