import Header from "../components/Header";
import Signup from "../components/Signup"

export default function SignupPage(){
    return(
        <>
        <div className="auth-page">
          <div className="auth-shell"> 
            <Header
              heading="Signup to create an account"
              paragraph="Already have an account? "
              linkName="Login"
              linkUrl="/"
            />
           <Signup/>
        </div>
        </div>
        </>
    )
}
