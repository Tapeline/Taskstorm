export default function HWhitespace({width}) {
    if (!width) width = 2;
    return <span className={"mx-" + width}></span>
}
