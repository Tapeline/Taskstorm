export default function VWhitespace({width}) {
    if (!width) width = 2;
    return <span className={"my-" + width}></span>
}
