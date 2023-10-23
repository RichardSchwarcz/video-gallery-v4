import Link from "next/link";

function NotionAuthPage() {
  return (
    <div className="p-4">
      <div className="text-2xl font-bold">Notion Auth Page</div>
      {/* href env.NOTION_URI */}
      <Link href={""}>Proceed for Authorization</Link>

      <div>Get Notion OAuth tokens</div>
    </div>
  );
}

export default NotionAuthPage;
