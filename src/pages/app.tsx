import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

function App() {
  //   const { data: sessionData } = useSession();
  const { refetch } = api.example.getYoutubeVideos.useQuery(undefined, {
    enabled: false,
  });
  const [videos, setVideos] = useState([]);
  return (
    <div className="p-4">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => void signOut()}>Sign out</Button>
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
