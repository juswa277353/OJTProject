import React, { useState, useRef } from 'react';
import { HiMail } from 'react-icons/hi'; // <- Import mail icon

const OTPInput = () => {
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

  return (
    <div className="flex flex-col justify-between h-screen px-4 py-8 bg-gray-100">
      {/* Top Section: Heading */}
      <div className="text-center mt-20">
        <h2 className="text-3xl font-bold">
          E-mail <br /> Verification
        </h2>
        <div className="flex justify-center mt-2">
          <HiMail className="text-9xl text-teil " />
      </div>
      <div className="text-left  mt-20 ml-4">
        <h5 className="text-base p-2 font-bold">
          Please enter your verification code
        </h5>
        <h5  className="text-sm p-2 font-outfit">
            We have sent a verification to your registered email ID. </h5>
</div>

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
        className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg bg-gray-500"
      />
    ))}
  </div>

  {/* Solid line under the OTP boxes */}
  <div className="border-t-2 border-black my-3 w-full"></div>
</div>

        <button
          type="button"
          onClick={() => alert('OTP Submitted: ' + otp.join(''))}
          className="w-full bg-teal-600 text-white py-4 rounded-lg hover:bg-teal-700 transition shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default OTPInput;
