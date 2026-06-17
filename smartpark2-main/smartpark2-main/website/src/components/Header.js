import {Link} from 'react-router-dom';
import carLogo from "../Images/SLogo.png";

export default function Header({
    heading,
    paragraph,
    linkName,
    linkUrl="#"
}){
    return(
        <div className="surface-card auth-header">
            <div className="auth-brand">
                <img alt="smartpark logo" src={carLogo} />
                <h1 className="auth-brand-text">smartpark</h1>
            </div>
            <h2 className="auth-heading">
                {heading}
            </h2>
            <p className="auth-subtext">
            {paragraph} {' '}
            <Link to={linkUrl}>
                {linkName}
            </Link>
            </p>
        </div>
    )
}
