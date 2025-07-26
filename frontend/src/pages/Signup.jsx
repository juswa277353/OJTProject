import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoArrowBackCircle } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineIdentification } from "react-icons/hi";
import { HiMail } from 'react-icons/hi';

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      newOtp.forEach((digit, idx) => {
        if (inputsRef.current[idx]) {
          inputsRef.current[idx].value = digit;
        }
      });
    }
    e.preventDefault();
  };


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstN, setFirstN] = useState("");
  const [lastN, setLastN] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [gender, setGender] = useState("");
  const [agree, setAgree] = useState(false);



  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Please agree to the terms and conditions.");


      return;
    }

    // Log all form values
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("First Name:", firstN);
    console.log("Last Name:", lastN);
    console.log("Phone Number:", phoneNo);
    console.log("Date of Birth:", selectedDate);
    console.log("Gender:", gender);
    console.log("Agreed to Terms:", agree);

    navigate("/verification");
  };

  return (

    //Choose Role Section
    <div className="flex items-start justify-center h-screen bg-primary">
      <form
        onSubmit={step === 4 && handleFinalSubmit}
        className="rounded w-[90%] py-10 flex flex-col justify-center items-center">
        {step === 1 && (
          <>
            <div className="w-full text-left mb-10">
              <IoArrowBackCircle className="text-secondary text-[2.5rem]" onClick={() => window.history.back()} />
            </div>

            <p className="font-outfit text-xl mb-10">Choose your role to get started</p>

            <div className="flex flex-col items-center justify-center gap-8 w-full">
              <div className="w-[80%] flex items-center justify-center flex-col border-3 border-secondary rounded-2xl ">
                <LuCalendarDays className="text-secondary text-[8rem]" />
                <p className="uppercase font-outfit text-secondary font-bold">organizer</p>
              </div>

              <div className="w-[80%] flex items-center justify-center flex-col border-3 border-secondary rounded-2xl">
                <HiOutlineIdentification className="text-secondary text-[9rem]" />
                <p className="uppercase font-outfit text-secondary font-bold">attendee</p>
              </div>

              <button className="bg-secondary w-[70%] py-2 rounded-md text-white uppercase shadow-md" onClick={() => setStep(2)}>done</button>
            </div>

            <p className="text-grey font-outfit mt-10">Already have an account? <Link className="text-secondary">Sign in</Link></p>
          </>
        )}


        {step === 2 && (
          <>
            <div className="w-full text-left">
              <IoArrowBackCircle className="text-secondary text-[2.5rem] mb-10" onClick={() => setStep(1)} />
            </div>

            <h2 className="text-2xl font-bold font-outfit mb-4 text-center">Sign Up</h2>


            <div className="mb-4 w-80">
              <label htmlFor="email" className="block mb-2 font-outfit text-sm pl-1 font-medium">E-mail</label>
              <input
                type="email" id="email"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-4 w-80">
              <label htmlFor="password" className="block mb-2 pl-1 text-sm font-outfit font-medium">Password</label>
              <input
                type="password" id="password"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="mb-6 w-80">
              <label htmlFor="confirmPassword" className="block mb-2 pl-1 text-sm font-outfit font-medium">Confirm Password</label>
              <input
                type="password" id="confirmPassword"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button              
              className="w-80 bg-secondary text-white py-2 font-outfit rounded-lg transition"
              onClick={() => setStep(3)}> Sign Up  </button>

            <div className="flex items-center justify-center mt-7">
              <div className="flex-grow border-t border-gray w-30 "></div>
              <span className="mx-4 text-black">or</span>
              <div className="flex-grow border-t border-gray w-30 "></div>
            </div>
            <p className="text-grey font-outfit mt-3">Already have an account? <Link className="text-secondary">Sign in</Link></p>

          </>
        )}


        {step === 3 && (
          <div className="w-full text-left">
              <IoArrowBackCircle className="text-secondary text-[2.5rem] mb-10" onClick={() => setStep(2)} />
          <div className="flex flex-col justify-between h-screen px-4 py-4 bg-primary">
            
            <div className="text-center mt-5">
              <h2 className="text-3xl font-out fitfont-bold"> E-mail <br /> Verification </h2>
              <div className="flex justify-center mt-6">
                <HiMail className="text-9xl text-secondary " />
              </div>
                <p className="text-base p-2 font-bold font-outfit text-left mt-10 md:w-80"> Please enter your verification code </p>
                <p className="text-base p-1  font-outfit text-left md:w-80 ">  We have sent a verification to your registered email ID. </p>

              {/* Bottom Section: OTP Input Box */}
              <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm mx-auto text-center">
                <div className="flex justify-center gap-2 mb-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      ref={(el) => (inputsRef.current[index] = el)}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg bg-gray-100"
                    />
                  ))}
                </div>

                <div className="border-t-2 border-black my-3 w-full"></div>
              </div>

              <button
                type="button" onClick={() => setStep(4)}
                className="w-full bg-teal-600 text-white py-4 rounded-lg hover:bg-teal-700 font-outfit transition shadow-lg md:w-80">
                Done
              </button>
            </div>
          </div>
          </div>
        )}

        {step === 4 && (

          // Fillup Information
          <>
           <div className="w-full text-left">
              <IoArrowBackCircle className="text-secondary text-[2.5rem] mb-10" onClick={() => setStep(3)} />
            </div>

            <h2 className="text-2xl font-bold mt-3 mb-4 text-center font-outfit">Fill up</h2>

            <div className="mb-4 w-80">
              <label htmlFor="firstN" className="block mb-2 pl-1 text-sm font-medium font-outfit"> First Name </label>
              <input
                type="text" id="firstN"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={firstN} onChange={(e) => setFirstN(e.target.value)} required />
            </div>

            <div className="mb-4 w-80">
              <label htmlFor="lastN" className="block mb-2pl-1 text-sm font-medium font-outfit">Last Name</label>
              <input
                type="text" id="lastN"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={lastN} onChange={(e) => setLastN(e.target.value)} required />
            </div>

            <div className="mb-4 w-80">
              <label htmlFor="phoneNo" className="block mb-2 pl-1 text-sm font-medium font-outfit">Phone Number</label>
              <input
                type="text" id="phoneNo"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required />
            </div>

            <div className="mb-4 w-80">
              <label htmlFor="date" className="block pl-1 mb-2 text-sm font-medium font-outfit">Date of Birth</label>
              <input type="date" id="date"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
            </div>

            <div className="mb-4 w-80">
              <label htmlFor="gender" className="block mb-2 pl-1 text-sm font-medium font-outfit">Gender</label>
              <select
                id="gender"
                className="w-full px-4 py-2  border rounded focus:ring-2 focus:ring-blue-400"
                value={gender} onChange={(e) => setGender(e.target.value)} required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center w-80">
              <input
                type="checkbox" id="agree" className="mr-2"
                checked={agree} onChange={(e) => setAgree(e.target.checked)} />
             <p className="font-outfit text-sm mb-4">
                I agree and I have read and accepted Eventchuchu.
                <span className="text-blue-500">Terms and Conditions</span> </p>
            </div>
            <button
              type="submit" className="w-80 bg-secondary text-white py-2 rounded-lg transition">
              Continue </button>
            <hr className=" mt-7 border-black w-85 h-2" />
         <p className="text-grey font-outfit mt-5">Already have an account? <Link className="text-secondary">Sign in</Link></p>

          </>
        )}
      </form>
    </div>
  );
}

export default Signup;