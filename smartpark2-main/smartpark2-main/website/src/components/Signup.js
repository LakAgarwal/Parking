import { useState } from "react";
import { signupFields } from "../constants/formFields";
import FormAction from "./FormAction";
import Input from "./Input";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const fields = signupFields;
let fieldsState = {};

fields.forEach((field) => (fieldsState[field.id] = ""));

export default function Signup() {
  const navigate = useNavigate();
  const [signupState, setSignupState] = useState(fieldsState);

  const handleChange = (e) =>
    setSignupState({ ...signupState, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(signupState);
    createAccount();
  };

  // handle Signup API Integration here
  const createAccount = async () => {
    try {
      const { data } = await axios.post('http://localhost:8080/api/v1/user/register', {
        username: signupState.username, 
        email: signupState.email, 
        password: signupState.password, 
      })
      console.log(data);
      alert("User Register Successfully");
      navigate('/')

    } catch (err) {
      console.log(err)
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <form className="surface-card auth-form" onSubmit={handleSubmit}>
      <div>
        {fields.map((field) => (
          <Input
            key={field.id}
            handleChange={handleChange}
            value={signupState[field.id]}
            labelText={field.labelText}
            labelFor={field.labelFor}
            id={field.id}
            name={field.name}
            type={field.type}
            isRequired={field.isRequired}
            placeholder={field.placeholder}
          />
        ))}
        <FormAction handleSubmit={handleSubmit} text="Signup" />
      </div>
    </form>
  );
}
