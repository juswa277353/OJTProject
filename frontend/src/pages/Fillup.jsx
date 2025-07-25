import React from "react";

function Fillup() {
  const [firstN, setFirstN] = React.useState("");
  const [lastN, setLastN] = React.useState("");
  const [phoneNo, setPhoneNo] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    console.log("First Name:", firstN);
    console.log("Last Name:", lastN);
    console.log("Phone Number:", phoneNo);
    console.log("Selected Date:", selectedDate);
    console.log("Gender:", gender);
    console.log("Agreed to Terms:", agree);
  };

  return (
    <div className="flex items-center justify-center h-screen rounded-lg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded w-full py-20 flex flex-col justify-center items-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Fill up the Information
        </h2>

        <div className="mb-4">
          <label htmlFor="firstN" className="block mb-2 text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            id="firstN"
            className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={firstN}
            onChange={(e) => setFirstN(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastN" className="block mb-2 text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="lastN"
            className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
            value={lastN}
            onChange={(e) => setLastN(e.target.value)}
            required
          />
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:space-x-4">
          <div>
            <label htmlFor="phoneNo" className="block mb-2 text-sm font-medium">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNo"
              className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block mt-3 text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block mt-3 text-sm font-medium">
              Gender
            </label>
            <select
              id="gender"
              className="w-72 px-4 py-1 border rounded focus:ring-2 focus:ring-blue-400"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center mt-5">
            <input
              type="checkbox"
              id="agree"
              className="mr-2"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="agree" className="text-sm font-medium">
              I agree to the Terms and Conditions
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-72 bg-blue text-white py-2 rounded hover:bg-blue-600 rounded-lg transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default Fillup;
