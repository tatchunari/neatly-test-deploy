const LoadingScreen = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center min-h-screen bg-gray-50">
      {/* Spinner */}
      <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>

      {/* Loading text */}
      <p className="mt-10 text-gray-700 text-xl font-medium">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
