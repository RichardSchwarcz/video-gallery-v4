import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import Link from "next/link";
import { ModeToggle } from "~/components/mode-toggle";
import { ProfileDropdownMenu } from "~/components/profile-dropdown-menu";
import { AuthorizationMenu } from "~/components/authorization-menu";
import AuthorizationConsent from "~/components/authorization-consent";

function App() {
  const callSSE = () => {
    const eventSource = new EventSource("/api/sync");
    eventSource.addEventListener("syncEvent", (e) => {
      console.log(JSON.parse(e.data));
    });
    eventSource.addEventListener("open", (e) => {
      console.log("open", e);
    });
    eventSource.addEventListener("error", (e) => {
      eventSource.close();
    });
  };

  const { status, data: sessionData } = useSession();

  const { refetch: refetchVideos } = api.youtube.getYoutubeVideos.useQuery(
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
      <nav className="flex flex-row-reverse items-center gap-2 rounded-md">
        <ProfileDropdownMenu sessionData={sessionData} />
        <AuthorizationMenu sessionData={sessionData} />
        <ModeToggle />
      </nav>

      <div className="flex items-center justify-center gap-4">
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
        <Button onClick={() => callSSE()}>CALL SSE</Button>
      </div>
      <div className="pt-4">
        {videos.map((video) => (
          <li key={video.etag}>{video.snippet.title}</li>
        ))}
      </div>
      <AuthorizationConsent />
    </div>
  );
}

export default App;
