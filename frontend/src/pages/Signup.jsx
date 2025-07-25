import React from "react";
import { useNavigate } from "react-router-dom";


function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  };

  const fillup = () => {
    navigate("/fillup");
  };

  return (
    <div className="flex items-center justify-center h-screen rounded-lg">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded w-full py-20 flex flex-col justify-center items-center" >
        <h2 className="text-2xl font-bold mb-4 text-center"> Create an Account </h2>
        <h4 className="text-2xl font-bold mb-6 text-center"> Hi, ATTENDEE! </h4>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium"> E-mail </label>
          <input
            type="email" id="email"
            className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Password </label>
          <input type="password" id="password" className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
            Confirm Password </label>
          <input type="password" id="confirmPassword" className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

          <button type="button" onClick={fillup}
          className="w-72 bg-red text-white py-2 rounded hover:bg-red-600 rounded-lg transition">
          Create New Account
        </button>
      </form>
    </div>
  );
}

export default Signup;
