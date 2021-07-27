import "../styles/globals.css";
import {Provider} from "next-auth/client";
import ReactModal from "react-modal";
import Navbar from "../components/Navbar";
import NProgress from "nprogress";
import "../styles/nprogress.css";
import Router from "next/router";
import "../styles/react-autocomplete-input.css";

export default function App({Component, pageProps}) {
    return (
        <Provider session={pageProps.session}>
            <Navbar/>
            <div id="app-root">
                <Component {...pageProps} />
            </div>
        </Provider>
    );
}

ReactModal.setAppElement("#app-root");