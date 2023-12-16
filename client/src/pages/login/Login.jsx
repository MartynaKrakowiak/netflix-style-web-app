import React, {useState} from "react";
import "./login.scss";
import { useNavigate } from 'react-router-dom';
import { useMyContext } from "../../MyContext";

const Login = () => {
  const navigate = useNavigate();
const {
   authenticateUser, updateLoginUser
  } = useMyContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    
  const handleLogin = async () => {
    try {
      const userData = await authenticateUser(email, password);
      if (userData) {
        navigate('/browse');
        const data = JSON.parse(userData);
        updateLoginUser(data)

      } else {
        console.log("Login failed")
      }
    } catch (error) {
      console.log(error)
    }
  };
  
  return (
    <div className="login">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://www.edigitalagency.com.au/wp-content/uploads/netflix-logo-white-png.png"
            alt=""
          />
        </div>
      </div>
      <div className="container">
        <form>
          <h1>Sign In</h1>
          <input
            type="email"
            placeholder="Email or phone number"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="loginButton" onClick={handleLogin}>Sign In</button>
          <span>
            New to VOD? <b>Sign up now</b>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
