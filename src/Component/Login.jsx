import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import LoginBg from "/images/Login.jpg";
import { auth, provider, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  // Function to check Firestore User Doc and set Role
  const checkAndSetRole = async (user) => {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    // If user doc exists
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (!userData.role) {
        const role = user.email === "vasanthlogan2525@gmail.com" ? "Admin" : "User";
        await setDoc(userDocRef, { ...userData, role }, { merge: true });
        console.log("Role updated to:", role);
      }
    } else {
      // If no doc, create new with role
      const role = user.email === "vasanthlogan2525@gmail.com" ? "Admin" : "User";
      await setDoc(userDocRef, {
        username: user.displayName || "No Name",
        email: user.email,
        role: role,
        password:`${user.displayName}123`,
        createdAt: new Date(),
      });
      console.log("New user created with role:", role);
    }
  };

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await checkAndSetRole(user); 

      setMessage("Login Successful!");
      setMessageType("success");

      
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();

      setTimeout(() => {
        if (userData?.role === "Admin") {
          navigate("/adminpanel");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      setMessage("Invalid email or password.");
      setMessageType("error");
      console.error("Login error:", error);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await checkAndSetRole(user); 

      setMessage("Login Successful via Google!");
      setMessageType("success");

     
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();

      setTimeout(() => {
        if (userData?.role === "Admin") {
          navigate("/adminpanel");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      setMessage("Google Sign-In failed.");
      setMessageType("error");
      console.error("Google Sign-In error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="flex flex-col md:flex-row max-w-5xl w-full shadow-lg border p-2 border-green-400 rounded-xl overflow-hidden h-auto md:h-[90vh]">
        <div className="hidden md:block md:w-1/2 h-64 md:h-auto">
          <img
            src={LoginBg}
            alt="Login Visual"
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>

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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                <input type="checkbox" required className="mr-2" />
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

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center border border-primary py-2 rounded-md hover:bg-gray-100 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link className="text-green-600 hover:underline font-medium" to="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
