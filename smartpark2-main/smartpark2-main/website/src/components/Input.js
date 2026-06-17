const fixedInputClass = "input-field";

export default function Input({
    handleChange,
    value,
    labelText,
    labelFor,
    id,
    name,
    type,
    isRequired=false,
    placeholder,
    customClass
}){
    return(
        <div className="input-group">
            <label htmlFor={labelFor}>
              {labelText}
            </label>
            <input
              onChange={handleChange}
              value={value}
              id={id}
              name={name}
              type={type}
              required={isRequired}
              className={`${fixedInputClass} ${customClass}`}
              placeholder={placeholder}
            />
          </div>
    )
}
