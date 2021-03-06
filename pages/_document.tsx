import Document, {Html, Head, Main, NextScript, DocumentContext} from "next/document";

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return initialProps;
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com/"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com"/>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        );
    }
}

export default MyDocument;