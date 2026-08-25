import PostEditor from "../PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>Edit Post</h1>
        <a className="admin-logout" href="/admin/blog">
          Back to Blog
        </a>
      </div>
      <PostEditor postId={id} />
    </div>
  );
}
