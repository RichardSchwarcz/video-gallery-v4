import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { OAUTH_GOOGLE_SCOPES } from "~/server/constants";

function YoutubeAuthPage() {
  const authorization = {
    scope: OAUTH_GOOGLE_SCOPES.join(" "),
  };

  return (
    <div className="p-4">
      <div className="text-2xl font-bold">Youtube Auth Page</div>
      <div>Next step of incremental authorization</div>
      <Button onClick={() => void signIn("google", undefined, authorization)}>
        Get Started
      </Button>
      <div>Get Youtube OAuth tokens with youtube scope</div>
    </div>
  );
}

export default YoutubeAuthPage;
