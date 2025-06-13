import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import LoginBg from "/images/Login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", foundUser.username);

      setMessage("Login Successful!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } else {
      setMessage("Invalid email or password.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleGoogleLogin = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
      const existingUser = users.find((user) => user.email === email);

      if (!existingUser) {
        const newUser = {
          username: name,
          email,
          password: `${name}@2525`,
          isAdmin: false,
        };
        users.push(newUser);
        localStorage.setItem("RegisterUser", JSON.stringify(users));
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", name);

      setMessage("Login Successful via Google!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Google Login Error:", err);
      setMessage("Google login failed.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  return (
    <GoogleOAuthProvider clientId="137142058878-ap9fh36jm6jv54g9j40iu7fah0am9t52.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="flex flex-col md:flex-row max-w-5xl w-full shadow-lg border p-2 border-green-400 rounded-xl overflow-hidden h-auto md:h-[90vh]">
          {/* Left Side Image */}
          <div className="hidden md:block md:w-1/2 h-64 md:h-auto">
            <img
              src={LoginBg}
              alt="Login Visual"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="mb-4">
              <img
                src="/images/Kavi_logo.png"
                alt="Logo"
                className="w-24 h-auto mx-auto md:mx-0"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">
              Log In
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center md:text-left">
              Please fill your details to access your account.
            </p>

            {message && (
              <div
                className={`p-2 text-center text-sm rounded mb-4 ${
                  messageType === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Id *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer select-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-green-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Log in
              </button>

              <div className="text-center text-gray-500 my-2 text-sm">
                or Sign in with
              </div>

              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setMessage("Google Sign-In Failed.");
                  setMessageType("error");
                }}
              />
            </form>

            <p className="text-sm text-center text-gray-600 mt-6">
              Don’t have an account?{" "}
              <Link
                className="text-green-600 hover:underline font-medium"
                to="/register"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
