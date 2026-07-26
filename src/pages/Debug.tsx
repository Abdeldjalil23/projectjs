const Debug = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Debug</h1>
        <p className="text-gray-600">App is rendering correctly.</p>
        <p className="text-sm text-gray-500">Path: {window.location.pathname}</p>
      </div>
    </div>
  );
};

export default Debug;
