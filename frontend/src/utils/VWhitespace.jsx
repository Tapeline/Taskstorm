export default function VWhitespace({size}) {
    if (!size) size = 2;
    return <div className={"py-" + size}></div>
}
