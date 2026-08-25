import PostEditor from "../PostEditor";

export default function NewPostPage() {
  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>New Post</h1>
        <a className="admin-logout" href="/admin/blog">
          Back to Blog
        </a>
      </div>
      <PostEditor />
    </div>
  );
}
