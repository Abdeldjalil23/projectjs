/** Full-page spinner, shown while a page's code or the saved session is loading. */
export const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-medsuite-primary border-t-transparent" />
  </div>
);

export default PageLoader;
