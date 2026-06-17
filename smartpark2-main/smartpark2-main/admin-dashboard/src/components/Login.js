import { useState } from 'react';
import { loginFields } from "../constants/formFields";
import FormAction from "./FormAction";
import FormExtra from "./FormExtra";
import Input from "./Input";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const fields = loginFields;
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Login() {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState(fieldsState);
  

  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    authenticateUser();
  }

  // Handle Login API Integration here
  const authenticateUser = async () => {
    try {
      const { data } = await axios.post("/api/v1/user/login", {
        email: loginState.email, // Use loginState values, not fields
        password: loginState.password, // Use loginState values, not fields
      });

      localStorage.setItem("userId", data?.user._id);
      navigate("/home");

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
    <form className="mt-1 space-y-6 bg-gray-50 p-6 rounded-md w-full shadow-lg glassmorphic" onSubmit={handleSubmit}>
      <div className="-space-y-px">
        {fields.map(field =>
          <Input
            key={field.id}
            handleChange={handleChange}
            value={loginState[field.id]}
            labelText={field.labelText}
            labelFor={field.labelFor}
            id={field.id}
            name={field.name}
            type={field.type}
            isRequired={field.isRequired}
            placeholder={field.placeholder}
          />
        )}
      </div>
      <FormExtra />
      <FormAction handleSubmit={handleSubmit} text="Login" />
    </form>
    </div>
    </>
  )
}
