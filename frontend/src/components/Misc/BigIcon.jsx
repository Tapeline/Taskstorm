export default function BigIcon(props) {
    const {icon, color, ...rest} = props;
    return <i className={rest?.className + " p-3 bi bi-" + icon}
              style={{borderRadius: "100px", fontSize: "1.35rem"}} {...rest}></i>;
}
