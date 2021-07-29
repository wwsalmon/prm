export default function splitTags(tagString: string) {
    return tagString.replace(/\s+/g, "").split("#").filter(d => !!d);
}