export default function VWhitespace({width}) {
    if (!width) width = 2;
    return <div className={"my-" + width}></div>
}
