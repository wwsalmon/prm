import Cursor from "../../components/Cursor";
import Container from "../../components/Container";
import DarkWrapper from "../../components/DarkWrapper";
import BigInput from "../../components/BigInput";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import useSWR, {SWRResponse} from "swr";
import {DatedObj, PrmContactObj} from "../../utils/types";
import fetcher from "../../utils/fetcher";
import Link from "next/link";

export default function G({}: {}) {
    const router = useRouter();
    const [searchString, setSearchString] = useState<string>("");
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const {data, error}: SWRResponse<{ data: DatedObj<PrmContactObj>[] }, any> = useSWR(`/api/contact?searchString=${searchString}`, fetcher);

    const dataReady = data && data.data;

    return (
        <DarkWrapper>
            <Container width="4xl" className="py-12" padding={8}>
                <p className="mb-12 text-5xl opacity-25">Go to contact</p>
                <div className="grid mb-8" style={{gridTemplateColumns: "36px 1fr"}}>
                    <Cursor match={true}/>
                    <BigInput
                        value={searchString}
                        setValue={setSearchString}
                        placeholder="Search for contact"
                        onKeyDown={e => {
                            if (e.key === "ArrowDown" && dataReady && selectedIndex < data.data.length - 1) {
                                e.preventDefault();
                                setSelectedIndex(selectedIndex + 1);
                            }
                            else if (e.key === "ArrowUp" && selectedIndex > 0) {
                                e.preventDefault();
                                setSelectedIndex(selectedIndex - 1);
                            }
                            else if (e.key === "Escape") router.push("/app");
                            else if (e.key === "Enter" && dataReady) router.push(`/app/c/${data.data[selectedIndex]._id}`);
                        }}
                        autoFocus={true}
                    />
                </div>
                {dataReady && data.data.map((d, i) => (
                    <Link href={`/app/c/${d._id}`}>
                        <a key={d._id} className={"-mx-4 px-4 rounded py-3 flex items-center " + (i === selectedIndex ? "bg-blue-900" : "opacity-50")}>
                            <p className="text-xl mr-3">{d.name}</p>
                            {d.tags.map(tag => (
                                <div key={d._id + tag} className="ml-2 opacity-50"><span>#{tag}</span></div>
                            ))}
                        </a>
                    </Link>
                ))}
            </Container>
        </DarkWrapper>
    );
}