import { Link } from "react-router-dom";

const SimpleLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-3xl font-bold">Simple Login</h1>
        <p className="text-gray-600">Placeholder login page for testing routes.</p>
        <div className="flex flex-col gap-2">
          <Link to="/debug" className="text-blue-500 hover:underline">
            Go to Debug
          </Link>
          <Link to="/simple-test" className="text-blue-500 hover:underline">
            Go to Simple Test
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
