'use client';

export default function LoginView({ onLogin }) {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-green-100 p-8 justify-center items-center">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl text-6xl border-4 border-green-200">
        🐾
      </div>
      <h1 className="text-3xl font-bold text-green-800 mb-2">BudgeMon</h1>
      <p className="text-green-600 mb-8">Your AI Financial Companion</p>

      <div className="w-full max-w-xs space-y-4">
        <input
          type="email"
          value="haeeunlee2005@gmail.com"
          readOnly
          className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700"
        />
        <input
          type="password"
          value="******"
          readOnly
          className="w-full p-4 rounded-xl border border-green-200 bg-white/80 text-gray-700"
        />
        <button
          onClick={onLogin}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-600 transition transform active:scale-95"
        >
          Log In
        </button>
        <div className="flex justify-between text-sm text-green-700 mt-4">
          <span>Forgot Password?</span>
          <span className="font-bold">Sign Up!</span>
        </div>
      </div>
    </div>
  );
}

