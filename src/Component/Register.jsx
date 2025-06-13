import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

import Registerbg from "/images/Register.jpg";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      setMessageType("error");
      return;
    }

    if (!agreed) {
      setMessage("You must agree to the terms and privacy policy.");
      setMessageType("error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
    const duplicate = users.find((user) => user.email === email);

    if (duplicate) {
      setMessage("User with this email already exists.");
      setMessageType("error");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const otp = generateOTP();
    setGeneratedOtp(otp);

    emailjs
      .send(
        "service_a6grxsl",
        "template_gi7vneo",
        {
          first_name: firstName,
          last_name: lastName,
          user_email: email,
          user_password: password,
          otp: otp,
        },
        "isAR5Sy8Y4PABFBmC"
      )
      .then(() => {
        setOtpSent(true);
        setMessage(`OTP sent to ${email}`);
        setMessageType("success");
      })
      .catch(() => {
        setMessage("Failed to send OTP. Try again.");
        setMessageType("error");
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (enteredOtp === generatedOtp) {
      const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
      const newUser = {
        username: `${firstName} ${lastName}`,
        email,
        password,
        isAdmin: false,
      };

      localStorage.setItem("RegisterUser", JSON.stringify([...users, newUser]));
      setMessage("OTP verified! Registration successful.");
      setMessageType("success");

      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage("Incorrect OTP.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="flex  max-w-6xl w-full h-[580px] p-2 bg-white rounded-xl border border-green-600 shadow-xl overflow-hidden">
        <div className="w-1/2 hidden md:block">
          <img
            src={Registerbg}
            alt="Fruits"
            className="h-full w-full object-cover rounded-3xl"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6">
            <img
              src="s/images/Kavi_logo.png"
              alt="Logo"
              className="w-20 h-auto mb-2"
            />
            <h2 className="text-3xl font-bold text-green-700">Register</h2>
            <p className="text-sm text-gray-600">
              Fill in your information to create your account.
            </p>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-sm ${
                messageType === "error"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}
            >
              {message}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-1/2 border border-green-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-1/2 border border-green-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <input
                type="email"
                name="user_email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-green-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              />

              <input
                type="password"
                name="user_password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-green-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  className="accent-green-600"
                />
                <label className="text-sm">
                  I agree with{" "}
                  <a href="#" className="underline text-green-600">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline text-green-600">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
              >
                Send OTP & Register
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                required
                className="w-full border border-green-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 rounded-md font-semibold hover:bg-yellow-600 transition"
              >
                Verify OTP & Complete Registration
              </button>
            </form>
          )}

          <p className="text-sm mt-6 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
