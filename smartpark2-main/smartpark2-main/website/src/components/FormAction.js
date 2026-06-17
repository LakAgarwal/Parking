export default function FormAction({
    type='Button',
    action='submit',
    text
}){
    return(
        <>
        {
            type==='Button' ?
            <button
                type={action}
                className="submit-btn"
            >
                {text}
            </button>
            :
            <></>
        }
        </>
    )
}
