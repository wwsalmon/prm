import Button from "./Button";

export default function KeyboardButton({href, onClick, keyName, keyLabel, label, navbar}: {href?: string, onClick?: () => any, keyName: string, keyLabel: string, label: string, navbar?: boolean}) {
    if ((+!!href + +!!onClick) !== 1) return <></>;
    let buttonProps: {href: string} | {onClick: () => any} = href ? {href: href} : {onClick: onClick};

    return (
        <Button {...buttonProps} className={"flex items-center h-16 hover:bg-blue-900 " + (navbar ? "-mx-4 px-4" : "-ml-4 mr-4 px-4 rounded")}>
            <div className="w-10 h-10 border border-white rounded text-xs flex items-center justify-center">
                <span>{keyLabel}</span>
            </div>
            <p className="ml-4 font-courier">{label}</p>
        </Button>
    );
}