import {NextApiResponse} from "next";

export const res403 = (res: NextApiResponse) => res.status(403).send("Unauthed");
export const res400 = (res: NextApiResponse) => res.status(400).send("Missing parameters");
export const res500 = (res: NextApiResponse, e: Error) => res.status(500).json({message: e});
export const res405 = (res: NextApiResponse) => res.status(405).send("Method not allowed");
export const res200 = (res: NextApiResponse, data: any) => res.status(200).json(data);
export const ssrRedirect = (destination: string) => ({redirect: {permanent: false, destination: destination}});
export const ssr404: {notFound: true} = {notFound: true};