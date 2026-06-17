export default function FormExtra(){
    return(
        <div className="form-extra">
        <div className="remember-wrap">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
          />
          <label htmlFor="remember-me">
            Remember me
          </label>
        </div>

        <div>
          <a href="/" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </div>

    )
}
