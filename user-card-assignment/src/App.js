// Install dependencies before running: npm install

import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfileCard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("https://randomuser.me/api/?page=1&results=1&seed=abc")
      .then(response => {
        setUser(response.data.results[0]);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
   <div className="h-screen w-screen flex items-center justify-center ">
     <div className="flex border rounded-lg shadow-lg p-6 max-w-lg mx-auto mt-10 bg-white hover:scale-105 duration-200 ease-in">
      <img className="w-24 h-24 rounded-lg border mr-6" src={user.picture.large} alt="Profile" />
      <div>
        <p className="text-lg font-semibold">{user.name.first} {user.name.last}</p>
        <p className="text-gray-600">Gender: {user.gender}</p>
        <p className="text-gray-600">Phone: {user.phone}</p>
      </div>
    </div>
   </div>
  );
};

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <ProfileCard />
    </div>
  );
};

export default App;
