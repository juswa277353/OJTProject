import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoArrowBackCircle } from "react-icons/io5";



function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  
  const signup = () => {
    navigate("/signup");
  };

  return (
     <div className="flex items-start justify-center h-screen bg-primary">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded w-full py-15 flex flex-col justify-center items-center" >
          <div className="w-full text-left  mb-7">
              <IoArrowBackCircle className="text-secondary text-[2.5rem]" onClick={() => window.history.back()} />
            </div>
            
            <img src="../../public/images/sariLogo.svg" alt="Logo" className="mb-5 w-60 h-20 justify-center items-center" />
      
      <div className="mb-1 py-0.5">
        <h2 className="text-2xl font-bold font-outfit text-5xl text-center ">Welcome!</h2>
        <div className="flex-grow border-t border-gray w-65 "></div>
        <p className="text-center front-bold font-outfit mb-4"> Sign in your account!</p>
        </div>
        <div className="mb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium front-outfit">E-mail</label>
          <input type="email" id="email" className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={email} onChange={(e) => setEmail(e.target.value)} required/>
       </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-sm font-medium"> Password </label>
          <input type="password" id="password" className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
 
        <p className="text-right text-xs font-outfit mb-4 pl-40"> Forgot Password?</p>
        <button type="button" onClick={signup} className="w-72 bg-secondary text-white py-2 rounded hover:bg-blue-600 rounded-lg transition">
           Login </button> 
           <div className="flex items-center my-4">
         <div className="flex-grow border-t border-gray w-30 "></div>
              <span className="mx-4 text-black">or</span>
              <div className="flex-grow border-t border-gray w-30 "></div> 
              </div> 

        
        <p className="text-xs text-gray-500 mt-4">Don't have an account?<Link className="text-secondary">Sign in</Link></p>
      </form>
    </div>
  );
}
   
export default Login;
